"use client";

import { useState, useTransition } from "react";
import { updateTargets } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import { visibleTargetFields, type TargetValues } from "@/lib/targets";
import { minutesToClock, parseClock } from "@/lib/measurements";
import type { MetricKey } from "@/lib/metrics";
import type { Tables } from "@/types/database.types";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

type NumericField = {
  name: string;
  label: string;
  integer: boolean;
  clock?: boolean;
};

const str = (value: number | null) => (value == null ? "" : String(value));

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
  // Velden opbouwen: reps wordt min/max, rust staat altijd onderaan.
  const fields: NumericField[] = [];
  for (const field of visibleTargetFields(exercise)) {
    if (field.key === "target_reps") {
      fields.push({ name: "target_reps", label: "Reps (min)", integer: true });
      fields.push({
        name: "target_reps_max",
        label: "Reps (max)",
        integer: true,
      });
    } else if (field.key === "target_minutes") {
      fields.push({
        name: "target_minutes",
        label: "Tijd (mm:ss)",
        integer: false,
        clock: true,
      });
    } else {
      fields.push({ name: field.key, label: field.label, integer: field.integer });
    }
  }
  fields.push({ name: "rest_seconds", label: "Rust (sec)", integer: true });

  const [values, setValues] = useState<Record<string, string>>(() => ({
    target_sets: str(targets.target_sets),
    target_reps: str(targets.target_reps),
    target_reps_max: str(targets.target_reps_max),
    target_weight: str(targets.target_weight),
    target_minutes:
      targets.target_minutes == null
        ? ""
        : minutesToClock(targets.target_minutes),
    target_distance: str(targets.target_distance),
    rest_seconds: str(restSeconds),
  }));
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function setVal(name: string, value: string) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: false }));
    setSaved(false);
    setServerError(null);
  }

  function validate(): { fieldErrors: Record<string, boolean>; message: string | null } {
    const fieldErrors: Record<string, boolean> = {};
    let message: string | null = null;

    for (const field of fields) {
      const raw = (values[field.name] ?? "").trim();
      if (raw === "") continue;

      if (field.clock) {
        if (parseClock(raw) === null) {
          fieldErrors[field.name] = true;
          if (!message) message = `${field.label} moet in mm:ss staan (bv. 1:30).`;
        }
        continue;
      }

      const num = Number(raw);
      if (
        !Number.isFinite(num) ||
        num < 0 ||
        (field.integer && !Number.isInteger(num))
      ) {
        fieldErrors[field.name] = true;
        if (!message) {
          message = `${field.label} moet een ${
            field.integer ? "heel getal" : "getal"
          } van 0 of hoger zijn.`;
        }
      }
    }

    const min = (values.target_reps ?? "").trim();
    const max = (values.target_reps_max ?? "").trim();
    if (
      min !== "" &&
      max !== "" &&
      !fieldErrors.target_reps &&
      !fieldErrors.target_reps_max &&
      Number(max) < Number(min)
    ) {
      fieldErrors.target_reps_max = true;
      if (!message) message = "Reps (max) mag niet lager zijn dan reps (min).";
    }

    return { fieldErrors, message };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const { fieldErrors, message } = validate();
    setErrors(fieldErrors);
    setServerError(message);
    setSaved(false);
    if (message) return;

    const formData = new FormData();
    for (const field of fields) formData.set(field.name, values[field.name] ?? "");

    startTransition(async () => {
      const result = await updateTargets(
        workoutExerciseId,
        workoutId,
        initialWorkoutFormState,
        formData,
      );
      if (result.error) {
        setServerError(result.error);
      } else {
        setSaved(true);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {fields.map((field) => (
          <Input
            key={field.name}
            label={field.label}
            name={field.name}
            type={field.clock ? "text" : "number"}
            inputMode={
              field.clock ? "numeric" : field.integer ? "numeric" : "decimal"
            }
            min={field.clock ? undefined : 0}
            step={field.clock ? undefined : field.integer ? 1 : "any"}
            value={values[field.name] ?? ""}
            onChange={(event) => setVal(field.name, event.target.value)}
            error={Boolean(errors[field.name])}
            placeholder={field.clock ? "mm:ss" : "—"}
          />
        ))}
      </div>
      <FormError message={serverError} />
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Opslaan…" : "Targets opslaan"}
        </Button>
        {saved && <span className="text-sm text-emerald-400">Opgeslagen ✓</span>}
      </div>
    </form>
  );
}
