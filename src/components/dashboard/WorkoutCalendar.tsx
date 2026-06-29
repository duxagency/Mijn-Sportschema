import Link from "next/link";

const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const TZ = "Europe/Amsterdam";

/** YYYY-MM-DD in de Europese tijdzone. */
function amsterdamDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

/** Maandag (YYYY-MM-DD) van de week waarin de gegeven dag valt. */
function mondayOf(date: Date): string {
  const offset = (date.getUTCDay() + 6) % 7;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() - offset);
  return monday.toISOString().slice(0, 10);
}

const CHECK = (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-3.5"
    aria-hidden="true"
  >
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * Kalender van de afgelopen 4 weken (ma–zo). Dagen met een afgeronde training
 * worden een groen bolletje met een vinkje en linken naar die training. Toont
 * ook de streak: aantal opeenvolgende weken met minstens één training.
 */
export function WorkoutCalendar({
  sessionByDate,
}: {
  sessionByDate: Record<string, string>;
}) {
  const done = new Set(Object.keys(sessionByDate));
  const todayStr = amsterdamDate(new Date());
  const today = new Date(`${todayStr}T12:00:00Z`);
  const mondayOffset = (today.getUTCDay() + 6) % 7;
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - mondayOffset - 21); // 4 weken incl. deze

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      day: d.getUTCDate(),
      done: done.has(date),
      isToday: date === todayStr,
      future: date > todayStr,
    };
  });

  const total = days.filter((d) => d.done).length;

  // Streak: opeenvolgende weken met minstens één training (huidige week mag
  // nog leeg zijn zonder de streak te breken).
  const trainedWeeks = new Set(
    Object.keys(sessionByDate).map((d) => mondayOf(new Date(`${d}T12:00:00Z`))),
  );
  const cursor = new Date(today);
  cursor.setUTCDate(today.getUTCDate() - mondayOffset);
  if (!trainedWeeks.has(cursor.toISOString().slice(0, 10))) {
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }
  let streak = 0;
  while (trainedWeeks.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 7);
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-medium text-neutral-300">
          Afgelopen 4 weken
        </h2>
        <span className="text-xs text-neutral-500">
          {streak > 0 && (
            <span className="text-amber-400">
              🔥 {streak} {streak === 1 ? "week" : "weken"} op rij ·{" "}
            </span>
          )}
          {total} {total === 1 ? "training" : "trainingen"}
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            className="text-center text-[10px] font-medium uppercase text-neutral-600"
          >
            {w}
          </div>
        ))}

        {days.map((d) => {
          const className = `flex aspect-square items-center justify-center rounded-full text-xs ${
            d.done
              ? "bg-emerald-600 text-white transition hover:bg-emerald-500"
              : d.isToday
                ? "text-neutral-200 ring-1 ring-neutral-500"
                : d.future
                  ? "text-neutral-700"
                  : "text-neutral-400"
          }`;

          if (d.done && sessionByDate[d.date]) {
            return (
              <Link
                key={d.date}
                href={`/sessions/${sessionByDate[d.date]}`}
                className={className}
                title={`Training op ${d.date}`}
              >
                {CHECK}
              </Link>
            );
          }

          return (
            <div key={d.date} className={className} title={d.date}>
              {d.done ? CHECK : d.day}
            </div>
          );
        })}
      </div>
    </section>
  );
}
