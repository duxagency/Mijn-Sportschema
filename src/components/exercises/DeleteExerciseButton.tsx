"use client";

import { useActionState } from "react";
import { deleteExercise } from "@/lib/actions/exercises";
import { initialExerciseFormState } from "@/lib/actions/exercise-types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function DeleteExerciseButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const [state, formAction] = useActionState(
    deleteExercise.bind(null, id),
    initialExerciseFormState,
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(`"${name}" verwijderen?`)) {
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
