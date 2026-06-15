"use client";

import { useActionState } from "react";
import { deleteWorkout } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function DeleteWorkoutButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, formAction] = useActionState(
    deleteWorkout.bind(null, id),
    initialWorkoutFormState,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`Schema "${name}" en alle oefeningen erin verwijderen?`)) {
            event.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="ghost">
          Schema verwijderen
        </Button>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
