"use client";

import { useActionState } from "react";
import { addExerciseToWorkout } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import type { Tables } from "@/types/database.types";
import { Select } from "@/components/ui/Select";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function AddExerciseForm({
  workoutId,
  exercises,
}: {
  workoutId: string;
  exercises: Pick<Tables<"exercises">, "id" | "name">[];
}) {
  const [state, formAction] = useActionState(
    addExerciseToWorkout.bind(null, workoutId),
    initialWorkoutFormState,
  );

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Er zijn nog geen oefeningen in de bibliotheek. Maak er eerst een aan.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="flex-1">
        <Select label="Oefening toevoegen" name="exercise_id" defaultValue="">
          <option value="" disabled>
            Kies een oefening…
          </option>
          {exercises.map((exercise) => (
            <option key={exercise.id} value={exercise.id}>
              {exercise.name}
            </option>
          ))}
        </Select>
      </div>
      <SubmitButton>Toevoegen</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
