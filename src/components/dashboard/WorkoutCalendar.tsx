const WEEKDAYS = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const TZ = "Europe/Amsterdam";

/** YYYY-MM-DD in de Europese tijdzone. */
function amsterdamDate(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TZ });
}

/**
 * Kalender van de afgelopen 4 weken (ma–zo). Dagen met een afgeronde training
 * worden een groen bolletje met een vinkje.
 */
export function WorkoutCalendar({ doneDates }: { doneDates: string[] }) {
  const done = new Set(doneDates);
  const todayStr = amsterdamDate(new Date());

  // Anker op het midden van de dag (UTC) zodat dag-rekenen DST-veilig is.
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

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-neutral-300">
          Afgelopen 4 weken
        </h2>
        <span className="text-xs text-neutral-500">
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

        {days.map((d) => (
          <div
            key={d.date}
            className={`flex aspect-square items-center justify-center rounded-full text-xs ${
              d.done
                ? "bg-emerald-600 text-white"
                : d.isToday
                  ? "text-neutral-200 ring-1 ring-neutral-500"
                  : d.future
                    ? "text-neutral-700"
                    : "text-neutral-400"
            }`}
            title={d.date}
          >
            {d.done ? (
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
            ) : (
              d.day
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
