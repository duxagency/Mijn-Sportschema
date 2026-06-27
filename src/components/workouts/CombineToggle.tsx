"use client";

import { useState, useTransition } from "react";
import { setExerciseCombined } from "@/lib/actions/workouts";

/**
 * Knop om een oefening te combineren met de oefening erboven (superset), of de
 * combinatie ongedaan te maken. Wordt alleen getoond als er een vorige oefening
 * is.
 */
export function CombineToggle({
  workoutExerciseId,
  workoutId,
  combined,
}: {
  workoutExerciseId: string;
  workoutId: string;
  combined: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setExerciseCombined(
        workoutExerciseId,
        workoutId,
        !combined,
      );
      if (result.error) setError(result.error);
    });
  }

  if (combined) {
    return (
      <div className="mb-3 flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-900/50 bg-emerald-950/20 px-3 py-1.5">
          <span className="text-xs font-medium text-emerald-400">
            ⛓ Superset — om en om met de vorige
          </span>
          <button
            type="button"
            onClick={toggle}
            disabled={pending}
            className="shrink-0 text-xs text-neutral-400 transition hover:text-neutral-200 disabled:opacity-50"
          >
            {pending ? "Bezig…" : "Loskoppelen"}
          </button>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mb-3 flex flex-col gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        className="self-start text-xs text-neutral-500 transition hover:text-neutral-300 disabled:opacity-50"
      >
        {pending ? "Combineren…" : "⛓ Combineer met vorige oefening"}
      </button>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
