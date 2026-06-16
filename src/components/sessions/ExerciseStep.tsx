"use client";

import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import {
  formatTargetReference,
  visibleMeasurements,
  type MeasurementKey,
} from "@/lib/measurements";
import type { SetInput } from "@/lib/actions/session-types";
import { MetricBadges } from "@/components/exercises/MetricBadges";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

export function ExerciseStep({
  exercise,
  targets,
  rows,
  onAddSet,
  onRemoveSet,
  onCellChange,
  onSave,
  saving,
  dirty,
  saved,
  error,
}: {
  exercise: Tables<"exercises">;
  targets: Record<TargetKey, number | null>;
  rows: SetInput[];
  onAddSet: () => void;
  onRemoveSet: (index: number) => void;
  onCellChange: (index: number, key: MeasurementKey, value: string) => void;
  onSave: () => void;
  saving: boolean;
  dirty: boolean;
  saved: boolean;
  error: string | null;
}) {
  const measurements = visibleMeasurements(exercise);
  const reference = formatTargetReference(exercise, targets);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-neutral-100">
          {exercise.name}
        </h2>
        <MetricBadges exercise={exercise} />
        {reference && (
          <p className="text-sm text-neutral-400">
            <span className="text-neutral-500">Target:</span> {reference}
          </p>
        )}
      </div>

      <ol className="mt-5 flex flex-col gap-3">
        {rows.map((row, index) => (
          <li
            key={index}
            className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-neutral-300">
                Set {index + 1}
              </span>
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSet(index)}
                  aria-label={`Set ${index + 1} verwijderen`}
                  className="rounded-md px-2 py-1 text-sm text-neutral-500 hover:text-red-300"
                >
                  Verwijderen
                </button>
              )}
            </div>

            {measurements.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-3">
                {measurements.map((measurement) => (
                  <Input
                    key={measurement.key}
                    label={measurement.label}
                    name={`${measurement.key}-${index}`}
                    type="number"
                    inputMode={measurement.integer ? "numeric" : "decimal"}
                    min={0}
                    step={measurement.integer ? 1 : "any"}
                    value={row[measurement.key]}
                    onChange={(event) =>
                      onCellChange(index, measurement.key, event.target.value)
                    }
                    placeholder={
                      targets[measurement.targetKey] != null
                        ? String(targets[measurement.targetKey])
                        : "—"
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-neutral-500">
                Deze oefening houdt geen meetwaarden bij.
              </p>
            )}
          </li>
        ))}
      </ol>

      <div className="mt-4 flex flex-col gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onAddSet}
          className="w-full"
        >
          + Set toevoegen
        </Button>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={onSave}
            disabled={saving || !dirty}
          >
            {saving ? "Opslaan…" : "Set opslaan"}
          </Button>
          {!dirty && saved && (
            <span className="text-sm text-emerald-400">Opgeslagen ✓</span>
          )}
        </div>

        <FormError message={error} />
      </div>
    </section>
  );
}
