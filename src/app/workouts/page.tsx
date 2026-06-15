import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateWorkoutForm } from "@/components/workouts/CreateWorkoutForm";
import { WorkoutListItem } from "@/components/workouts/WorkoutListItem";

export default async function WorkoutsPage() {
  const supabase = await createClient();
  const { data: workouts } = await supabase
    .from("workouts")
    .select("*, workout_exercises(count)")
    .order("created_at", { ascending: false });

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
          Mijn schema&apos;s
        </h1>
        <p className="text-sm text-neutral-400">
          Je eigen trainingsschema&apos;s. Alleen jij ziet deze.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <h2 className="mb-4 text-sm font-medium text-neutral-300">
          Nieuw schema
        </h2>
        <CreateWorkoutForm />
      </section>

      {workouts && workouts.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3">
          {workouts.map((workout) => (
            <WorkoutListItem
              key={workout.id}
              workout={workout}
              exerciseCount={workout.workout_exercises[0]?.count ?? 0}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Je hebt nog geen schema&apos;s. Maak er hierboven een aan.
        </p>
      )}
    </main>
  );
}
