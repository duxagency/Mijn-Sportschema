import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import { formatSet, formatTargetReference } from "@/lib/measurements";
import { MetricBadges } from "@/components/exercises/MetricBadges";

export type ReviewExercise = {
  workoutExerciseId: string;
  exercise: Tables<"exercises">;
  targets: Record<TargetKey, number | null>;
};

export function SessionReview({
  exercises,
  setsByExercise,
  improvements = {},
}: {
  exercises: ReviewExercise[];
  setsByExercise: Record<string, Tables<"session_sets">[]>;
  improvements?: Record<string, { delta: number; unit: string }>;
}) {
  if (exercises.length === 0) {
    return (
      <p className="mt-10 text-center text-sm text-neutral-400">
        Dit schema heeft geen oefeningen meer.
      </p>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {exercises.map(({ workoutExerciseId, exercise, targets }) => {
        const sets = setsByExercise[workoutExerciseId] ?? [];
        const reference = formatTargetReference(exercise, targets);
        const improvement = improvements[workoutExerciseId];

        return (
          <section
            key={workoutExerciseId}
            className="rounded-lg border border-neutral-800 bg-neutral-950 p-4"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h2 className="font-medium text-neutral-100">{exercise.name}</h2>
                {improvement && <ImprovementBadge improvement={improvement} />}
              </div>
              <MetricBadges exercise={exercise} />
              {reference && (
                <p className="text-xs text-neutral-500">Target: {reference}</p>
              )}
            </div>

            {sets.length > 0 ? (
              <ol className="mt-3 flex flex-col gap-1.5">
                {sets.map((set) => (
                  <li
                    key={set.id}
                    className="flex items-baseline gap-3 text-sm"
                  >
                    <span className="w-12 shrink-0 tabular-nums text-neutral-500">
                      Set {set.set_number}
                    </span>
                    <span className="text-neutral-200">
                      {formatSet(exercise, set)}
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                Geen sets ingevoerd.
              </p>
            )}
          </section>
        );
      })}
    </div>
  );
}

function ImprovementBadge({
  improvement,
}: {
  improvement: { delta: number; unit: string };
}) {
  const delta = Number(improvement.delta.toFixed(2));
  const { unit } = improvement;

  if (delta > 0) {
    return (
      <span className="text-xs font-medium text-emerald-400">
        ↑ +{delta} {unit} t.o.v. vorige keer
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="text-xs font-medium text-amber-400">
        ↓ {delta} {unit} t.o.v. vorige keer
      </span>
    );
  }
  return (
    <span className="text-xs text-neutral-500">gelijk aan vorige keer</span>
  );
}
