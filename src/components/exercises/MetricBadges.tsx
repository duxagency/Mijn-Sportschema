import { activeMetrics, type MetricKey } from "@/lib/metrics";
import type { Tables } from "@/types/database.types";

export function MetricBadges({
  exercise,
}: {
  exercise: Pick<Tables<"exercises">, MetricKey>;
}) {
  const active = activeMetrics(exercise);

  if (active.length === 0) {
    return <span className="text-xs text-neutral-500">Geen metrics</span>;
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {active.map((metric) => (
        <span
          key={metric.key}
          className="rounded-full border border-neutral-700 bg-neutral-900 px-2 py-0.5 text-xs text-neutral-300"
        >
          {metric.label}
        </span>
      ))}
    </div>
  );
}
