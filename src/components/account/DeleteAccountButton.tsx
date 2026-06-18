"use client";

import { useActionState } from "react";
import { deleteAccount } from "@/lib/actions/account";
import { initialAccountState } from "@/lib/actions/account-types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function DeleteAccountButton() {
  const [state, action] = useActionState(deleteAccount, initialAccountState);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !confirm(
            "Weet je het zeker? Je account en al je gegevens (schema's, trainingen) worden permanent verwijderd.",
          )
        ) {
          event.preventDefault();
        }
      }}
      className="flex flex-col gap-2"
    >
      <Button
        type="submit"
        variant="ghost"
        className="border-red-900/60 text-red-300 hover:bg-red-950/30"
      >
        Account verwijderen
      </Button>
      <FormError message={state.error} />
    </form>
  );
}
