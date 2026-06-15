"use client";

import { useActionState } from "react";
import { updateTargets } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { visibleTargetFields, type TargetKey } from "@/lib/targets";
import type { MetricKey } from "@/lib/metrics";
import type { Tables } from "@/types/database.types";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

export function TargetsForm({
  workoutExerciseId,
  workoutId,
  exercise,
  targets,
}: {
  workoutExerciseId: string;
  workoutId: string;
  exercise: Pick<Tables<"exercises">, MetricKey>;
  targets: Record<TargetKey, number | null>;
}) {
  const [state, formAction] = useActionState(
    updateTargets.bind(null, workoutExerciseId, workoutId),
    initialWorkoutFormState,
  );

  const fields = visibleTargetFields(exercise);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <Input
            key={field.key}
            label={field.label}
            name={field.key}
            type="number"
            min={0}
            step={field.integer ? 1 : "any"}
            defaultValue={targets[field.key] ?? ""}
            placeholder="—"
          />
        ))}
      </div>
      <FormError message={state.error} />
      <div>
        <SubmitButton>Targets opslaan</SubmitButton>
      </div>
    </form>
  );
}
