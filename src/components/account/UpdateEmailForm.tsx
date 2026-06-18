"use client";

import { useActionState } from "react";
import { updateEmail } from "@/lib/actions/account";
import { initialAccountState } from "@/lib/actions/account-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function UpdateEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, action] = useActionState(updateEmail, initialAccountState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="E-mailadres"
        name="email"
        type="email"
        defaultValue={currentEmail}
        required
      />
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <FormError message={state.error} />
      <SubmitButton>E-mailadres wijzigen</SubmitButton>
    </form>
  );
}
