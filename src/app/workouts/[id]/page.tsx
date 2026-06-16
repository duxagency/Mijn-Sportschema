import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AddExerciseForm } from "@/components/workouts/AddExerciseForm";
import { DeleteWorkoutButton } from "@/components/workouts/DeleteWorkoutButton";
import { StartTrainingButton } from "@/components/sessions/StartTrainingButton";
import { SortableExerciseList } from "@/components/workouts/SortableExerciseList";
import type { WorkoutExerciseWithExercise } from "@/components/workouts/WorkoutExerciseCard";
import { FormError } from "@/components/ui/FormError";

export default async function WorkoutDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: workout } = await supabase
    .from("workouts")
    .select("*")
    .eq("id", id)
    .single();

  if (!workout) {
    notFound();
  }

  const [
    { data: workoutExercises, error: exercisesError },
    { data: library },
  ] = await Promise.all([
    supabase
      .from("workout_exercises")
      .select(
        "id, position, target_sets, target_reps, target_weight, target_minutes, target_distance, exercise:exercises(*)",
      )
      .eq("workout_id", id)
      .order("position", { ascending: true }),
    supabase.from("exercises").select("id, name").order("name"),
  ]);

  const exercises = (workoutExercises ?? []) as WorkoutExerciseWithExercise[];

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <Link
            href="/workouts"
            className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
          >
            ← Mijn schema&apos;s
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
            {workout.name}
          </h1>
        </div>
        <DeleteWorkoutButton id={workout.id} name={workout.name} />
      </header>

      {exercises.length > 0 && (
        <section className="mt-6">
          <StartTrainingButton workoutId={workout.id} />
        </section>
      )}

      <section className="mt-6 rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <AddExerciseForm workoutId={workout.id} exercises={library ?? []} />
      </section>

      {exercisesError ? (
        <div className="mt-6">
          <FormError message="Kon de oefeningen van dit schema niet laden. Probeer de pagina te vernieuwen." />
        </div>
      ) : exercises.length > 0 ? (
        <SortableExerciseList exercises={exercises} workoutId={workout.id} />
      ) : (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Nog geen oefeningen in dit schema. Voeg er hierboven een toe.
        </p>
      )}
    </main>
  );
}
