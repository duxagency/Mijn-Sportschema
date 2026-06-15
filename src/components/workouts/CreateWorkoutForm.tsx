"use client";

import { useActionState } from "react";
import { createWorkout } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function CreateWorkoutForm() {
  const [state, formAction] = useActionState(
    createWorkout,
    initialWorkoutFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Naam van het schema"
        name="name"
        type="text"
        required
        placeholder="Bijv. Push dag"
      />
      <FormError message={state.error} />
      <SubmitButton>Schema aanmaken</SubmitButton>
    </form>
  );
}
