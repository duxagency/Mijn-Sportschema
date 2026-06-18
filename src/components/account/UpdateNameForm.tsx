"use client";

import { useActionState } from "react";
import { updateDisplayName } from "@/lib/actions/account";
import { initialAccountState } from "@/lib/actions/account-types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [state, action] = useActionState(updateDisplayName, initialAccountState);

  return (
    <form action={action} className="flex flex-col gap-4">
      <Input
        label="Weergavenaam"
        name="display_name"
        type="text"
        defaultValue={currentName}
        required
      />
      {state.success && (
        <p className="text-sm text-emerald-400">{state.success}</p>
      )}
      <FormError message={state.error} />
      <SubmitButton>Naam opslaan</SubmitButton>
    </form>
  );
}
