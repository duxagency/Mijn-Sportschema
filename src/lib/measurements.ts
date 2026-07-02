import type { MetricKey } from "@/lib/metrics";
import type { TargetKey, TargetValues } from "@/lib/targets";
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

// -------------------------------------------------------------------------
// Tijd: intern opgeslagen als decimale minuten, in/uitvoer als mm:ss.
// -------------------------------------------------------------------------

/** Decimale minuten → "m:ss" (bv. 0.75 → "0:45", 1.5 → "1:30"). */
export function minutesToClock(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Parset "mm:ss" of "m:ss" (of een los getal = minuten) naar decimale minuten.
 * Geeft null bij ongeldige invoer.
 */
export function parseClock(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;

  if (trimmed.includes(":")) {
    const parts = trimmed.split(":");
    if (parts.length !== 2) return null;
    const m = Number(parts[0]);
    const s = Number(parts[1]);
    if (
      !Number.isInteger(m) ||
      !Number.isInteger(s) ||
      m < 0 ||
      s < 0 ||
      s > 59
    ) {
      return null;
    }
    return m + s / 60;
  }

  const n = Number(trimmed);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

/** Formatteert één meetwaarde met eenheid; tijd als mm:ss. */
export function formatMeasurementValue(
  measurement: (typeof MEASUREMENTS)[number],
  value: number,
): string {
  if (measurement.key === "minutes") return minutesToClock(value);
  return `${value} ${measurement.unit}`;
}

// Volgorde waarin we de "belangrijkste" meetwaarde kiezen voor een grafiek:
// gewicht zegt het meest over kracht, daarna reps, tijd, afstand.
const CHART_PRIORITY: readonly MeasurementKey[] = [
  "weight",
  "reps",
  "minutes",
  "distance",
] as const;

/** De meetwaarde die we standaard in de progressie-grafiek tonen, of null. */
export function primaryMeasurement(exercise: Pick<Tables<"exercises">, MetricKey>) {
  for (const key of CHART_PRIORITY) {
    const measurement = MEASUREMENTS.find((m) => m.key === key);
    if (measurement && exercise[measurement.requires]) return measurement;
  }
  return null;
}

/**
 * Formatteert de ingevoerde waarden van één set, bv. "10 reps · 20 kg".
 * Alleen de metrics die de oefening bijhoudt en een waarde hebben.
 */
export function formatSet(
  exercise: Pick<Tables<"exercises">, MetricKey>,
  set: Pick<Tables<"session_sets">, MeasurementKey>,
): string {
  const parts = visibleMeasurements(exercise)
    .map((measurement) => {
      const value = set[measurement.key];
      return value != null ? formatMeasurementValue(measurement, value) : null;
    })
    .filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(" · ") : "—";
}

/**
 * Compacte weergave van één set voor een referentie, bv. "80 kg × 8" voor
 * gewicht+reps, anders de aanwezige meetwaarden ("8 reps", "0.75 min").
 */
export function formatSetShort(
  exercise: Pick<Tables<"exercises">, MetricKey>,
  set: Pick<Tables<"session_sets">, MeasurementKey>,
): string {
  if (
    exercise.tracks_weight &&
    exercise.tracks_reps &&
    set.weight != null &&
    set.reps != null
  ) {
    return `${set.weight} kg × ${set.reps}`;
  }

  const parts = visibleMeasurements(exercise)
    .map((measurement) => {
      const value = set[measurement.key];
      return value != null ? formatMeasurementValue(measurement, value) : null;
    })
    .filter((part): part is string => part !== null);

  return parts.length > 0 ? parts.join(" · ") : "—";
}

/**
 * Bouwt een korte referentie van de targets van een oefening, bv.
 * "3 sets · 10 reps · 20 kg". Geeft null als er geen enkele target staat.
 */
export function formatTargetReference(
  exercise: Pick<Tables<"exercises">, MetricKey>,
  targets: TargetValues,
): string | null {
  const parts: string[] = [];

  if (targets.target_sets != null) {
    parts.push(`${targets.target_sets} sets`);
  }

  for (const measurement of visibleMeasurements(exercise)) {
    const value = targets[measurement.targetKey];
    if (value == null) continue;

    // Reps kan een range zijn (6–10) als de bovengrens hoger staat.
    if (
      measurement.key === "reps" &&
      targets.target_reps_max != null &&
      targets.target_reps_max > value
    ) {
      parts.push(`${value}–${targets.target_reps_max} ${measurement.unit}`);
    } else {
      parts.push(formatMeasurementValue(measurement, value));
    }
  }

  return parts.length > 0 ? parts.join(" · ") : null;
}
