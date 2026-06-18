"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { startSession } from "@/lib/actions/sessions";
import { initialSessionFormState } from "@/lib/actions/session-types";

function StartButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 rounded-md bg-neutral-100 px-3.5 py-1.5 text-sm font-medium text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-400"
    >
      {pending ? "…" : "Start"}
    </button>
  );
}

/** Compacte knop die direct een training start voor het gegeven schema. */
export function QuickStartButton({ workoutId }: { workoutId: string }) {
  const [state, formAction] = useActionState(
    startSession.bind(null, workoutId),
    initialSessionFormState,
  );

  return (
    <form action={formAction} className="shrink-0">
      <StartButton />
      {state.error && (
        <p className="mt-1 text-right text-xs text-red-400">{state.error}</p>
      )}
    </form>
  );
}
