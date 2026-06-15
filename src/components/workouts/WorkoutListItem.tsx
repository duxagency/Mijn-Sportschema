import Link from "next/link";
import type { Tables } from "@/types/database.types";

export function WorkoutListItem({
  workout,
  exerciseCount,
}: {
  workout: Tables<"workouts">;
  exerciseCount: number;
}) {
  return (
    <li>
      <Link
        href={`/workouts/${workout.id}`}
        className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-600"
      >
        <span className="font-medium text-neutral-100">{workout.name}</span>
        <span className="text-sm text-neutral-400">
          {exerciseCount} {exerciseCount === 1 ? "oefening" : "oefeningen"} →
        </span>
      </Link>
    </li>
  );
}
