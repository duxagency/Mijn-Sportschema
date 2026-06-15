"use client";

import { useActionState } from "react";
import { removeWorkoutExercise } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function RemoveExerciseButton({
  workoutExerciseId,
  workoutId,
  exerciseName,
}: {
  workoutExerciseId: string;
  workoutId: string;
  exerciseName: string;
}) {
  const [state, formAction] = useActionState(
    removeWorkoutExercise.bind(null, workoutExerciseId, workoutId),
    initialWorkoutFormState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`"${exerciseName}" uit dit schema verwijderen?`)) {
            event.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="ghost">
          Verwijderen
        </Button>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
