import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { primaryMeasurement } from "@/lib/measurements";
import { formatShortDate } from "@/lib/format";
import { ProgressChart } from "@/components/progress/ProgressChart";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ exercise?: string }>;
}) {
  const { exercise: requestedId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Platte queries (RLS schermt alles al af op de eigen gebruiker).
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
  const sets = setsData ?? [];

  // Welke oefeningen heb je daadwerkelijk getraind (afgeronde sessies)?
  const trainedIds = new Set<string>();
  for (const set of sets) {
    if (!finishedDate.has(set.session_id)) continue;
    const exId = exerciseOf.get(set.workout_exercise_id);
    if (exId) trainedIds.add(exId);
  }

  const trained = [...trainedIds]
    .map((id) => exerciseById.get(id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .sort((a, b) => a.name.localeCompare(b.name));

  const selected =
    (requestedId && trainedIds.has(requestedId)
      ? exerciseById.get(requestedId)
      : undefined) ?? trained[0];

  // Datapunten voor de geselecteerde oefening: per sessie de hoogste waarde
  // van de primaire meetwaarde.
  let points: { label: string; value: number }[] = [];
  const measurement = selected ? primaryMeasurement(selected) : null;
  if (selected && measurement) {
    const perSession = new Map<string, number>();
    for (const set of sets) {
      if (!finishedDate.has(set.session_id)) continue;
      if (exerciseOf.get(set.workout_exercise_id) !== selected.id) continue;
      const value = set[measurement.key];
      if (value == null) continue;
      const current = perSession.get(set.session_id);
      if (current == null || value > current) {
        perSession.set(set.session_id, value);
      }
    }
    points = [...perSession.entries()]
      .map(([sessionId, value]) => ({
        date: finishedDate.get(sessionId) as string,
        value,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((p) => ({ label: formatShortDate(p.date), value: p.value }));
  }

  const latest = points.length > 0 ? points[points.length - 1].value : null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
          Voortgang
        </h1>
        <p className="text-sm text-neutral-400">
          Je beste set per training, over tijd.
        </p>
      </header>

      {trained.length === 0 ? (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Nog geen data. Rond eerst een training af, dan zie je hier je
          voortgang.
        </p>
      ) : (
        <>
          <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
            {trained.map((exercise) => {
              const active = exercise.id === selected?.id;
              return (
                <Link
                  key={exercise.id}
                  href={`/progress?exercise=${exercise.id}`}
                  scroll={false}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
                    active
                      ? "border-neutral-500 bg-neutral-800 text-neutral-100"
                      : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
                  }`}
                >
                  {exercise.name}
                </Link>
              );
            })}
          </div>

          {selected && measurement ? (
            <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-medium text-neutral-100">
                  {selected.name}
                </h2>
                {latest != null && (
                  <span className="text-sm text-neutral-400">
                    Laatste:{" "}
                    <span className="font-medium text-neutral-100">
                      {latest} {measurement.unit}
                    </span>
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-neutral-500">
                Hoogste {measurement.label.toLowerCase()} per training ·{" "}
                {points.length}{" "}
                {points.length === 1 ? "training" : "trainingen"}
              </p>
              <div className="mt-4">
                <ProgressChart points={points} />
              </div>
            </section>
          ) : (
            <p className="mt-10 text-center text-sm text-neutral-400">
              Voor deze oefening houden we geen meetbare waarde bij.
            </p>
          )}
        </>
      )}
    </main>
  );
}
