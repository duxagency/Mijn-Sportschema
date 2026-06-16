import type { MetricKey } from "@/lib/metrics";
import type { TargetKey } from "@/lib/targets";
import type { Tables } from "@/types/database.types";

/**
 * De meetwaarden die je per set invoert tijdens een training. Eén bron van
 * waarheid voor de invoervelden, de validatie én de target-referentie.
 *
 * Elke meetwaarde hangt aan een metric (tracks_*) van de oefening en aan de
 * bijbehorende kolom in session_sets en de target-kolom in workout_exercises.
 */
export type MeasurementKey = "reps" | "weight" | "minutes" | "distance";

export const MEASUREMENTS: readonly {
  /** Kolom in session_sets. */
  key: MeasurementKey;
  /** Label boven het invoerveld. */
  label: string;
  /** Korte eenheid voor de target-referentie ("10 reps", "20 kg"). */
  unit: string;
  /** De metric die deze meetwaarde nodig heeft. */
  requires: MetricKey;
  /** De target-kolom in workout_exercises om als referentie te tonen. */
  targetKey: TargetKey;
  /** Hele getallen (reps) vs. decimalen (gewicht/tijd/afstand). */
  integer: boolean;
}[] = [
  {
    key: "reps",
    label: "Reps",
    unit: "reps",
    requires: "tracks_reps",
    targetKey: "target_reps",
    integer: true,
  },
  {
    key: "weight",
    label: "Gewicht (kg)",
    unit: "kg",
    requires: "tracks_weight",
    targetKey: "target_weight",
    integer: false,
  },
  {
    key: "minutes",
    label: "Tijd (min)",
    unit: "min",
    requires: "tracks_time",
    targetKey: "target_minutes",
    integer: false,
  },
  {
    key: "distance",
    label: "Afstand (km)",
    unit: "km",
    requires: "tracks_distance",
    targetKey: "target_distance",
    integer: false,
  },
] as const;

/** De meetwaarden die voor deze oefening ingevoerd moeten worden. */
export function visibleMeasurements(
  exercise: Pick<Tables<"exercises">, MetricKey>,
) {
  return MEASUREMENTS.filter((measurement) => exercise[measurement.requires]);
}

/**
 * Bouwt een korte referentie van de targets van een oefening, bv.
 * "3 sets · 10 reps · 20 kg". Geeft null als er geen enkele target staat.
 */
export function formatTargetReference(
  exercise: Pick<Tables<"exercises">, MetricKey>,
  targets: Record<TargetKey, number | null>,
): string | null {
  const parts: string[] = [];

  if (targets.target_sets != null) {
    parts.push(`${targets.target_sets} sets`);
  }

  for (const measurement of visibleMeasurements(exercise)) {
    const value = targets[measurement.targetKey];
    if (value != null) {
      parts.push(`${value} ${measurement.unit}`);
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
