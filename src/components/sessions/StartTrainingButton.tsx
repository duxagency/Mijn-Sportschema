"use client";

import { useActionState } from "react";
import { startSession } from "@/lib/actions/sessions";
import { initialSessionFormState } from "@/lib/actions/session-types";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function StartTrainingButton({ workoutId }: { workoutId: string }) {
  const [state, formAction] = useActionState(
    startSession.bind(null, workoutId),
    initialSessionFormState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <SubmitButton>Start training</SubmitButton>
      <FormError message={state.error} />
    </form>
  );
}
