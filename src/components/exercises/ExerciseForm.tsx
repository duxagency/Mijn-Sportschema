"use client";

import { useActionState } from "react";
import { METRICS, type MetricKey } from "@/lib/metrics";
import { CATEGORIES, DEFAULT_CATEGORY } from "@/lib/categories";
import {
  initialExerciseFormState,
  type ExerciseFormState,
} from "@/lib/actions/exercise-types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormError } from "@/components/ui/FormError";
import { SubmitButton } from "@/components/ui/SubmitButton";

type ExerciseFormProps = {
  action: (
    prev: ExerciseFormState,
    formData: FormData,
  ) => Promise<ExerciseFormState>;
  submitLabel: string;
  defaultValues?: {
    name: string;
    category: string;
    metrics: Record<MetricKey, boolean>;
  };
};

export function ExerciseForm({
  action,
  submitLabel,
  defaultValues,
}: ExerciseFormProps) {
  const [state, formAction] = useActionState(action, initialExerciseFormState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Input
        label="Naam"
        name="name"
        type="text"
        required
        defaultValue={defaultValues?.name}
        placeholder="Bijv. Bench press"
      />

      <Select
        label="Categorie"
        name="category"
        defaultValue={defaultValues?.category ?? DEFAULT_CATEGORY}
      >
        {CATEGORIES.map((category) => (
          <option key={category.key} value={category.key}>
            {category.label}
          </option>
        ))}
      </Select>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-medium text-neutral-300">
          Welke metrics houdt deze oefening bij?
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {METRICS.map((metric) => (
            <Checkbox
              key={metric.key}
              name={metric.key}
              label={metric.label}
              defaultChecked={defaultValues?.metrics[metric.key]}
            />
          ))}
        </div>
      </fieldset>

      <FormError message={state.error} />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}
