import type { Tables } from "@/types/database.types";

/**
 * De metrics die een oefening kan bijhouden. Eén bron van waarheid voor zowel
 * de checkboxes in het formulier als de badges in de lijst.
 */
export type MetricKey =
  | "tracks_weight"
  | "tracks_reps"
  | "tracks_time"
  | "tracks_distance";

export const METRICS: readonly { key: MetricKey; label: string }[] = [
  { key: "tracks_weight", label: "Gewicht" },
  { key: "tracks_reps", label: "Reps" },
  { key: "tracks_time", label: "Tijd" },
  { key: "tracks_distance", label: "Afstand" },
] as const;

/** Geeft de aangevinkte metrics van een oefening terug, in vaste volgorde. */
export function activeMetrics(exercise: Pick<Tables<"exercises">, MetricKey>) {
  return METRICS.filter((metric) => exercise[metric.key]);
}
