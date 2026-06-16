"use client";

import { useActionState } from "react";
import { deleteSession } from "@/lib/actions/sessions";
import { initialSessionFormState } from "@/lib/actions/session-types";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function DeleteSessionButton({
  sessionId,
  label = "Verwijderen",
  confirmText = "Deze training verwijderen?",
}: {
  sessionId: string;
  label?: string;
  confirmText?: string;
}) {
  const [state, formAction] = useActionState(
    deleteSession.bind(null, sessionId),
    initialSessionFormState,
  );

  return (
    <div className="flex flex-col items-end gap-1">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (!confirm(confirmText)) {
            event.preventDefault();
          }
        }}
      >
        <Button type="submit" variant="ghost">
          {label}
        </Button>
      </form>
      <FormError message={state.error} />
    </div>
  );
}
