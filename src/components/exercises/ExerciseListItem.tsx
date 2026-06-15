import Link from "next/link";
import type { Tables } from "@/types/database.types";
import { MetricBadges } from "./MetricBadges";
import { DeleteExerciseButton } from "./DeleteExerciseButton";

export function ExerciseListItem({
  exercise,
}: {
  exercise: Tables<"exercises">;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
      <div className="flex flex-col gap-2">
        <span className="font-medium text-neutral-100">{exercise.name}</span>
        <MetricBadges exercise={exercise} />
      </div>
      <div className="flex flex-col items-end gap-2">
        <Link
          href={`/exercises/${exercise.id}/edit`}
          className="text-sm font-medium text-neutral-300 underline-offset-4 hover:text-neutral-100 hover:underline"
        >
          Wijzigen
        </Link>
        <DeleteExerciseButton id={exercise.id} name={exercise.name} />
      </div>
    </li>
  );
}
