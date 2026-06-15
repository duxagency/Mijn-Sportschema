"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function RegisterForm() {
  const [state, formAction] = useActionState(register, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Naam"
        name="display_name"
        type="text"
        autoComplete="name"
        required
        placeholder="Hoe mogen we je noemen?"
      />
      <Input
        label="E-mailadres"
        name="email"
        type="email"
        autoComplete="email"
        required
        placeholder="jij@voorbeeld.nl"
      />
      <Input
        label="Wachtwoord"
        name="password"
        type="password"
        autoComplete="new-password"
        required
        minLength={6}
        placeholder="Minstens 6 tekens"
      />
      <FormError message={state.error} />
      <SubmitButton>Account aanmaken</SubmitButton>
    </form>
  );
}
