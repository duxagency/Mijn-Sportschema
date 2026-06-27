import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import type { SetInput } from "@/lib/actions/session-types";
import { EMPTY_SET } from "@/lib/actions/session-types";
import { primaryMeasurement } from "@/lib/measurements";
import { formatDuration, formatSessionDate } from "@/lib/format";
import { TrainingFlow, type FlowExercise } from "@/components/sessions/TrainingFlow";
import {
  SessionReview,
  type ReviewExercise,
} from "@/components/sessions/SessionReview";
import { DeleteSessionButton } from "@/components/sessions/DeleteSessionButton";
import { FormError } from "@/components/ui/FormError";

type WorkoutExerciseRow = Pick<
  Tables<"workout_exercises">,
  "id" | "position" | "note" | "combined_with_previous" | TargetKey
> & { exercise: Tables<"exercises"> };

const numToStr = (value: number | null) => (value == null ? "" : String(value));

const toSetInput = (set: Tables<"session_sets">): SetInput => ({
  reps: numToStr(set.reps),
  weight: numToStr(set.weight),
  minutes: numToStr(set.minutes),
  distance: numToStr(set.distance),
});

/** Hoogste waarde van de primaire meetwaarde over een set-lijst, of null. */
function bestPrimaryValue(
  exercise: Tables<"exercises">,
  sets: Tables<"session_sets">[],
): number | null {
  const measurement = primaryMeasurement(exercise);
  if (!measurement) return null;
  let best: number | null = null;
  for (const set of sets) {
    const value = set[measurement.key];
    if (value != null && (best == null || value > best)) best = value;
  }
  return best;
}

export default async function SessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (!session) {
    notFound();
  }

  const [
    { data: workout },
    { data: workoutExercises, error: exercisesError },
    { data: sets },
  ] = await Promise.all([
      supabase
        .from("workouts")
        .select("name")
        .eq("id", session.workout_id)
        .single(),
      supabase
        .from("workout_exercises")
        .select(
          "id, position, note, combined_with_previous, target_sets, target_reps, target_weight, target_minutes, target_distance, exercise:exercises(*)",
        )
        .eq("workout_id", session.workout_id)
        .order("position", { ascending: true }),
      supabase
        .from("session_sets")
        .select("*")
        .eq("session_id", id)
        .order("set_number", { ascending: true }),
    ]);

  const exercises = (workoutExercises ?? []) as WorkoutExerciseRow[];
  const workoutName = workout?.name ?? "Training";

  // Sets groeperen per workout_exercise.
  const setsByExercise: Record<string, Tables<"session_sets">[]> = {};
  for (const set of sets ?? []) {
    (setsByExercise[set.workout_exercise_id] ??= []).push(set);
  }

  const targetsOf = (row: WorkoutExerciseRow): Record<TargetKey, number | null> => ({
    target_sets: row.target_sets,
    target_reps: row.target_reps,
    target_weight: row.target_weight,
    target_minutes: row.target_minutes,
    target_distance: row.target_distance,
  });

  // -------------------------------------------------------------------------
  // Afgeronde training: alleen-lezen terugblik.
  // -------------------------------------------------------------------------
  if (session.finished_at) {
    const reviewExercises: ReviewExercise[] = exercises.map((row) => ({
      workoutExerciseId: row.id,
      exercise: row.exercise,
      targets: targetsOf(row),
    }));

    // Vorige afgeronde training van dit schema (vóór deze) → verbeteringen.
    const improvementByExercise: Record<
      string,
      { delta: number; unit: string }
    > = {};

    const { data: prevSession } = await supabase
      .from("sessions")
      .select("id")
      .eq("workout_id", session.workout_id)
      .not("finished_at", "is", null)
      .lt("started_at", session.started_at)
      .order("started_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (prevSession) {
      const { data: prevSets } = await supabase
        .from("session_sets")
        .select("*")
        .eq("session_id", prevSession.id);

      const prevByExercise: Record<string, Tables<"session_sets">[]> = {};
      for (const set of prevSets ?? []) {
        (prevByExercise[set.workout_exercise_id] ??= []).push(set);
      }

      for (const row of exercises) {
        const measurement = primaryMeasurement(row.exercise);
        if (!measurement) continue;
        const now = bestPrimaryValue(row.exercise, setsByExercise[row.id] ?? []);
        const before = bestPrimaryValue(row.exercise, prevByExercise[row.id] ?? []);
        if (now == null || before == null) continue;
        improvementByExercise[row.id] = {
          delta: now - before,
          unit: measurement.unit,
        };
      }
    }

    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
        <header className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-6">
          <div>
            <Link
              href="/sessions"
              className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
            >
              ← Mijn trainingen
            </Link>
            <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
              {workoutName}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {formatSessionDate(session.started_at)} ·{" "}
              {formatDuration(session.started_at, session.finished_at)}
            </p>
          </div>
          <DeleteSessionButton
            sessionId={session.id}
            label="Verwijderen"
            confirmText="Deze training uit je historie verwijderen?"
          />
        </header>

        {exercisesError ? (
          <div className="mt-6">
            <FormError message="Kon deze training niet laden. Probeer de pagina te vernieuwen." />
          </div>
        ) : (
          <SessionReview
            exercises={reviewExercises}
            setsByExercise={setsByExercise}
            improvements={improvementByExercise}
          />
        )}

        <Link
          href="/dashboard"
          className="mt-8 block w-full rounded-lg bg-neutral-100 px-4 py-3 text-center text-base font-semibold text-neutral-900 transition hover:bg-white"
        >
          Terug naar dashboard
        </Link>
      </main>
    );
  }

  // -------------------------------------------------------------------------
  // Lopende training: de invoerflow.
  // -------------------------------------------------------------------------

  if (exercisesError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
        <header className="border-b border-neutral-800 pb-6">
          <Link
            href="/sessions"
            className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
          >
            ← Mijn trainingen
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
            {workoutName}
          </h1>
        </header>
        <div className="mt-6">
          <FormError message="Kon deze training niet laden. Probeer de pagina te vernieuwen." />
        </div>
      </main>
    );
  }

  // Laatst afgeronde training van dit schema → "vorige keer"-referentie + prefill.
  const previousSetsByExercise: Record<string, Tables<"session_sets">[]> = {};
  const { data: previousSession } = await supabase
    .from("sessions")
    .select("id")
    .eq("workout_id", session.workout_id)
    .not("finished_at", "is", null)
    .order("started_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (previousSession) {
    const { data: previousSets } = await supabase
      .from("session_sets")
      .select("*")
      .eq("session_id", previousSession.id)
      .order("set_number", { ascending: true });

    for (const set of previousSets ?? []) {
      (previousSetsByExercise[set.workout_exercise_id] ??= []).push(set);
    }
  }

  // PR per oefening: hoogste primaire meetwaarde over álle afgeronde trainingen.
  const exerciseObjById = new Map(
    exercises.map((row) => [row.exercise.id, row.exercise]),
  );
  const [
    { data: finishedSessions },
    { data: allWorkoutExercises },
    { data: allSets },
  ] = await Promise.all([
    supabase.from("sessions").select("id").not("finished_at", "is", null),
    supabase.from("workout_exercises").select("id, exercise_id"),
    supabase
      .from("session_sets")
      .select("session_id, workout_exercise_id, reps, weight, minutes, distance"),
  ]);

  const finishedIds = new Set((finishedSessions ?? []).map((s) => s.id));
  const weToExercise = new Map(
    (allWorkoutExercises ?? []).map((we) => [we.id, we.exercise_id]),
  );
  const prByExerciseId = new Map<string, number>();
  for (const set of allSets ?? []) {
    if (!finishedIds.has(set.session_id)) continue;
    const exId = weToExercise.get(set.workout_exercise_id);
    if (!exId) continue;
    const exObj = exerciseObjById.get(exId);
    if (!exObj) continue;
    const measurement = primaryMeasurement(exObj);
    if (!measurement) continue;
    const value = set[measurement.key];
    if (value == null) continue;
    const current = prByExerciseId.get(exId);
    if (current == null || value > current) prByExerciseId.set(exId, value);
  }

  const flowExercises: FlowExercise[] = exercises.map((row) => {
    const existing = setsByExercise[row.id] ?? [];
    const previous = previousSetsByExercise[row.id] ?? [];
    const initialSets: SetInput[] =
      existing.length > 0
        ? existing.map(toSetInput)
        : previous.length > 0
          ? previous.map(toSetInput)
          : Array.from({ length: Math.max(1, row.target_sets ?? 1) }, () => ({
              ...EMPTY_SET,
            }));

    const measurement = primaryMeasurement(row.exercise);
    const prValue = prByExerciseId.get(row.exercise.id);
    const pr =
      measurement && prValue != null
        ? { value: prValue, unit: measurement.unit }
        : null;

    return {
      workoutExerciseId: row.id,
      exercise: row.exercise,
      targets: targetsOf(row),
      note: row.note,
      combinedWithPrevious: row.combined_with_previous,
      previousSets: previous,
      pr,
      initialSets,
    };
  });

  return (
    <TrainingFlow
      sessionId={session.id}
      workoutId={session.workout_id}
      workoutName={workoutName}
      exercises={flowExercises}
    />
  );
}
