import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import type { SetInput } from "@/lib/actions/session-types";
import { EMPTY_SET } from "@/lib/actions/session-types";
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
  "id" | "position" | "note" | TargetKey
> & { exercise: Tables<"exercises"> };

const numToStr = (value: number | null) => (value == null ? "" : String(value));

const toSetInput = (set: Tables<"session_sets">): SetInput => ({
  reps: numToStr(set.reps),
  weight: numToStr(set.weight),
  minutes: numToStr(set.minutes),
  distance: numToStr(set.distance),
});

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
          "id, position, note, target_sets, target_reps, target_weight, target_minutes, target_distance, exercise:exercises(*)",
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
          />
        )}
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

  // Nog geen eigen sets in déze sessie? Haal dan de laatst afgeronde sessie
  // van hetzelfde schema op, zodat we daarmee kunnen voorvullen.
  const hasOwnSets = Object.keys(setsByExercise).length > 0;
  const previousSetsByExercise: Record<string, Tables<"session_sets">[]> = {};

  if (!hasOwnSets) {
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

    return {
      workoutExerciseId: row.id,
      exercise: row.exercise,
      targets: targetsOf(row),
      note: row.note,
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
