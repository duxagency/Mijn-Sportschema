import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import { MetricBadges } from "@/components/exercises/MetricBadges";
import { TargetsForm } from "./TargetsForm";
import { RemoveExerciseButton } from "./RemoveExerciseButton";

export type WorkoutExerciseWithExercise = Pick<
  Tables<"workout_exercises">,
  "id" | "position" | TargetKey
> & {
  exercise: Tables<"exercises">;
};

export function WorkoutExerciseCard({
  workoutExercise,
  workoutId,
  index,
}: {
  workoutExercise: WorkoutExerciseWithExercise;
  workoutId: string;
  index: number;
}) {
  const { exercise } = workoutExercise;

  return (
    <li className="rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-sm tabular-nums text-neutral-500">
            {index + 1}.
          </span>
          <div className="flex flex-col gap-2">
            <span className="font-medium text-neutral-100">
              {exercise.name}
            </span>
            <MetricBadges exercise={exercise} />
          </div>
        </div>
        <RemoveExerciseButton
          workoutExerciseId={workoutExercise.id}
          workoutId={workoutId}
          exerciseName={exercise.name}
        />
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-4">
        <TargetsForm
          workoutExerciseId={workoutExercise.id}
          workoutId={workoutId}
          exercise={exercise}
          targets={{
            target_sets: workoutExercise.target_sets,
            target_reps: workoutExercise.target_reps,
            target_weight: workoutExercise.target_weight,
            target_minutes: workoutExercise.target_minutes,
            target_distance: workoutExercise.target_distance,
          }}
        />
      </div>
    </li>
  );
}
