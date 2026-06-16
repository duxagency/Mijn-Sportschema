import Link from "next/link";
import { formatDuration, formatSessionDate } from "@/lib/format";

export function SessionHistoryItem({
  id,
  workoutName,
  startedAt,
  finishedAt,
}: {
  id: string;
  workoutName: string;
  startedAt: string;
  finishedAt: string;
}) {
  return (
    <li>
      <Link
        href={`/sessions/${id}`}
        className="flex items-center justify-between gap-4 rounded-lg border border-neutral-800 bg-neutral-950 p-4 transition hover:border-neutral-600"
      >
        <div className="flex flex-col">
          <span className="font-medium text-neutral-100">{workoutName}</span>
          <span className="text-sm text-neutral-400">
            {formatSessionDate(startedAt)}
          </span>
        </div>
        <span className="shrink-0 text-sm text-neutral-400">
          {formatDuration(startedAt, finishedAt)} →
        </span>
      </Link>
    </li>
  );
}
