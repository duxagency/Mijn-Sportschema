"use client";

import { useActionState } from "react";
import { updatePassword } from "@/lib/actions/account";
import { initialAccountState } from "@/lib/actions/account-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function UpdatePasswordForm() {
  const [state, action] = useActionState(updatePassword, initialAccountState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Nieuw wachtwoord"
        name="password"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      <Input
        label="Herhaal nieuw wachtwoord"
        name="password_confirm"
        type="password"
        autoComplete="new-password"
        minLength={6}
        required
      />
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <FormError message={state.error} />
      <SubmitButton>Wachtwoord wijzigen</SubmitButton>
    </form>
  );
}
