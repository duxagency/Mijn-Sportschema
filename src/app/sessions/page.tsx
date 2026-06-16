import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatSessionDate } from "@/lib/format";
import { SessionHistoryItem } from "@/components/sessions/SessionHistoryItem";

export default async function SessionsPage() {
  const supabase = await createClient();
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, started_at, finished_at, workout:workouts(name)")
    .order("started_at", { ascending: false });

  const all = sessions ?? [];
  const inProgress = all.filter((session) => !session.finished_at);
  const finished = all.filter((session) => session.finished_at);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
          Mijn trainingen
        </h1>
        <p className="text-sm text-neutral-400">
          Je afgeronde trainingen, nieuwste eerst.
        </p>
      </header>

      {inProgress.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium text-neutral-300">
            Nog bezig
          </h2>
          <ul className="flex flex-col gap-3">
            {inProgress.map((session) => (
              <li key={session.id}>
                <Link
                  href={`/sessions/${session.id}`}
                  className="flex items-center justify-between gap-4 rounded-lg border border-amber-900/60 bg-amber-950/20 p-4 transition hover:border-amber-700"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-neutral-100">
                      {session.workout?.name ?? "Training"}
                    </span>
                    <span className="text-sm text-neutral-400">
                      Gestart {formatSessionDate(session.started_at)}
                    </span>
                  </div>
                  <span className="shrink-0 text-sm text-amber-300">
                    Hervatten →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {finished.length > 0 ? (
        <ul className="mt-6 flex flex-col gap-3">
          {finished.map((session) => (
            <SessionHistoryItem
              key={session.id}
              id={session.id}
              workoutName={session.workout?.name ?? "Training"}
              startedAt={session.started_at}
              finishedAt={session.finished_at as string}
            />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Je hebt nog geen trainingen afgerond. Start er een vanaf een schema.
        </p>
      )}
    </main>
  );
}
