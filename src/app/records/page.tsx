import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database.types";
import {
  primaryMeasurement,
  visibleMeasurements,
} from "@/lib/measurements";
import { formatShortDate } from "@/lib/format";

type SetRow = Pick<
  Tables<"session_sets">,
  "session_id" | "workout_exercise_id" | "reps" | "weight" | "minutes" | "distance"
>;

export default async function RecordsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const [
    { data: sessionsData },
    { data: workoutExercisesData },
    { data: setsData },
    { data: exercisesData },
  ] = await Promise.all([
    supabase
      .from("sessions")
      .select("id, started_at")
      .not("finished_at", "is", null),
    supabase.from("workout_exercises").select("id, exercise_id"),
    supabase
      .from("session_sets")
      .select("session_id, workout_exercise_id, reps, weight, minutes, distance"),
    supabase
      .from("exercises")
      .select(
        "id, name, tracks_weight, tracks_reps, tracks_time, tracks_distance",
      ),
  ]);

  const finishedDate = new Map(
    (sessionsData ?? []).map((s) => [s.id, s.started_at]),
  );
  const exerciseOf = new Map(
    (workoutExercisesData ?? []).map((we) => [we.id, we.exercise_id]),
  );
  const exerciseById = new Map((exercisesData ?? []).map((e) => [e.id, e]));

  // Per oefening de beste set (hoogste waarde van de primaire meetwaarde).
  type Best = { value: number; set: SetRow; date: string };
  const best = new Map<string, Best>();
  for (const set of (setsData ?? []) as SetRow[]) {
    const date = finishedDate.get(set.session_id);
    if (!date) continue;
    const exId = exerciseOf.get(set.workout_exercise_id);
    if (!exId) continue;
    const exercise = exerciseById.get(exId);
    if (!exercise) continue;
    const measurement = primaryMeasurement(exercise);
    if (!measurement) continue;
    const value = set[measurement.key];
    if (value == null) continue;
    const current = best.get(exId);
    if (!current || value > current.value) {
      best.set(exId, { value, set, date });
    }
  }

  const records = [...best.entries()]
    .map(([exId, record]) => ({
      exercise: exerciseById.get(exId)!,
      ...record,
    }))
    .sort((a, b) => a.exercise.name.localeCompare(b.exercise.name));

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-100">Records</h1>
        <p className="text-sm text-neutral-400">
          Je beste set per oefening, uit al je afgeronde trainingen.
        </p>
      </header>

      {records.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Nog geen records. Rond eerst een training af.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {records.map(({ exercise, value, set, date }) => {
            const measurement = primaryMeasurement(exercise)!;
            const context = visibleMeasurements(exercise)
              .filter((m) => m.key !== measurement.key && set[m.key] != null)
              .map((m) => `${set[m.key]} ${m.unit}`)
              .join(" · ");

            return (
              <li
                key={exercise.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-neutral-100">
                    {exercise.name}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    {context ? `${context} · ` : ""}
                    {formatShortDate(date)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-xl font-semibold text-neutral-100">
                    {value}
                  </span>{" "}
                  <span className="text-sm text-neutral-400">
                    {measurement.unit}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
