"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { initialAuthState } from "@/lib/actions/auth-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function LoginForm() {
  const [state, formAction] = useActionState(login, initialAuthState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
        autoComplete="current-password"
        required
        placeholder="••••••••"
      />
      <FormError message={state.error} />
      <SubmitButton>Inloggen</SubmitButton>
    </form>
  );
}
