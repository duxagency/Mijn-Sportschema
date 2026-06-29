import type { MetricKey } from "@/lib/metrics";
import type { Tables } from "@/types/database.types";

/**
 * De target-velden van een oefening binnen een schema. target_sets is altijd
 * zichtbaar; de overige velden alleen als de oefening de bijbehorende metric
 * bijhoudt. Eén bron van waarheid voor het formulier én de validatie.
 */
export type TargetKey =
  | "target_sets"
  | "target_reps"
  | "target_weight"
  | "target_minutes"
  | "target_distance";

/** Target-waarden van een oefening, inclusief de optionele reps-bovengrens. */
export type TargetValues = Record<TargetKey, number | null> & {
  target_reps_max: number | null;
};

export const TARGET_FIELDS: readonly {
  key: TargetKey;
  label: string;
  /** De metric die deze target nodig heeft, of null als hij altijd geldt. */
  requires: MetricKey | null;
  /** Hele getallen (sets/reps) vs. decimalen (gewicht/tijd/afstand). */
  integer: boolean;
}[] = [
  { key: "target_sets", label: "Sets", requires: null, integer: true },
  { key: "target_reps", label: "Reps", requires: "tracks_reps", integer: true },
  {
    key: "target_weight",
    label: "Gewicht (kg)",
    requires: "tracks_weight",
    integer: false,
  },
  {
    key: "target_minutes",
    label: "Tijd (min)",
    requires: "tracks_time",
    integer: false,
  },
  {
    key: "target_distance",
    label: "Afstand (km)",
    requires: "tracks_distance",
    integer: false,
  },
] as const;

/** De target-velden die voor deze oefening getoond moeten worden. */
export function visibleTargetFields(
  exercise: Pick<Tables<"exercises">, MetricKey>,
) {
  return TARGET_FIELDS.filter(
    (field) => field.requires === null || exercise[field.requires],
  );
}
