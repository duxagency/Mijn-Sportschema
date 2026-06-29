"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import { MetricBadges } from "@/components/exercises/MetricBadges";
import { TargetsForm } from "./TargetsForm";
import { RemoveExerciseButton } from "./RemoveExerciseButton";
import { ExerciseNote } from "./ExerciseNote";
import { CombineToggle } from "./CombineToggle";

export type WorkoutExerciseWithExercise = Pick<
  Tables<"workout_exercises">,
  | "id"
  | "position"
  | "note"
  | "combined_with_previous"
  | "rest_seconds"
  | TargetKey
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
  const hasPrevious = index > 0;
  const combined = hasPrevious && workoutExercise.combined_with_previous;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: workoutExercise.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border border-neutral-800 bg-neutral-950 p-4 ${
        combined ? "border-l-2 border-l-emerald-800" : ""
      } ${
        isDragging ? "relative z-10 opacity-80 shadow-lg shadow-black/40" : ""
      }`}
    >
      {hasPrevious && (
        <CombineToggle
          workoutExerciseId={workoutExercise.id}
          workoutId={workoutId}
          combined={combined}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-2">
          <button
            type="button"
            aria-label="Sleep om te herschikken"
            className="-ml-1 mt-0.5 cursor-grab touch-none rounded p-1 text-neutral-500 hover:text-neutral-300 active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripIcon />
          </button>
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
          restSeconds={workoutExercise.rest_seconds}
        />
      </div>

      <div className="mt-4 border-t border-neutral-800 pt-4">
        <ExerciseNote
          workoutExerciseId={workoutExercise.id}
          workoutId={workoutId}
          initialNote={workoutExercise.note}
        />
      </div>
    </li>
  );
}

/** Greep-icoon (twee rijen puntjes) voor het slepen. */
function GripIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="5.5" cy="3.5" r="1.4" />
      <circle cx="10.5" cy="3.5" r="1.4" />
      <circle cx="5.5" cy="8" r="1.4" />
      <circle cx="10.5" cy="8" r="1.4" />
      <circle cx="5.5" cy="12.5" r="1.4" />
      <circle cx="10.5" cy="12.5" r="1.4" />
    </svg>
  );
}
