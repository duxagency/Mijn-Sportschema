"use client";

import { Fragment, useActionState } from "react";
import { updateTargets } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { visibleTargetFields, type TargetValues } from "@/lib/targets";
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
  restSeconds,
}: {
  workoutExerciseId: string;
  workoutId: string;
  exercise: Pick<Tables<"exercises">, MetricKey>;
  targets: TargetValues;
  restSeconds: number | null;
}) {
  const [state, formAction] = useActionState(
    updateTargets.bind(null, workoutExerciseId, workoutId),
    initialWorkoutFormState,
  );

  const fields = visibleTargetFields(exercise);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map((field) =>
          field.key === "target_reps" ? (
            <Fragment key={field.key}>
              <Input
                label="Reps (min)"
                name="target_reps"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={targets.target_reps ?? ""}
                placeholder="—"
              />
              <Input
                label="Reps (max)"
                name="target_reps_max"
                type="number"
                inputMode="numeric"
                min={0}
                step={1}
                defaultValue={targets.target_reps_max ?? ""}
                placeholder="—"
              />
            </Fragment>
          ) : (
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
          ),
        )}
        <Input
          label="Rust (sec)"
          name="rest_seconds"
          type="number"
          inputMode="numeric"
          min={0}
          step={5}
          defaultValue={restSeconds ?? ""}
          placeholder="—"
        />
      </div>
      <FormError message={state.error} />
      <div>
        <SubmitButton>Targets opslaan</SubmitButton>
      </div>
    </form>
  );
}
