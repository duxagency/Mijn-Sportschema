import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormError } from "@/components/ui/FormError";
import { AppVersion } from "@/components/ui/AppVersion";
import { QuickStartButton } from "@/components/sessions/QuickStartButton";
import { DashboardMenu } from "@/components/dashboard/DashboardMenu";
import { WorkoutCalendar } from "@/components/dashboard/WorkoutCalendar";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Extra controle naast de middleware: zonder geldige gebruiker geen toegang.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  const metadataName = user.user_metadata?.display_name as string | undefined;
  const displayName =
    profile?.display_name ??
    metadataName ??
    user.email?.split("@")[0] ??
    "sporter";

  const [{ data: workoutsData }, { data: sessionsData }] = await Promise.all([
    supabase
      .from("workouts")
      .select("id, name, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("sessions")
      .select("id, workout_id, started_at, finished_at")
      .order("started_at", { ascending: false }),
  ]);

  const workouts = workoutsData ?? [];
  const sessions = sessionsData ?? [];

  // Afgeronde trainingen → datum → sessie-id (nieuwste die dag) voor de kalender.
  const sessionByDate: Record<string, string> = {};
  for (const s of sessions) {
    if (!s.finished_at) continue;
    const date = new Date(s.finished_at).toLocaleDateString("en-CA", {
      timeZone: "Europe/Amsterdam",
    });
    if (!(date in sessionByDate)) sessionByDate[date] = s.id;
  }

  // Snel starten: max 5 schema's, gesorteerd op de meest recente training.
  // Zonder enige training tonen we de eerst gemaakte schema's.
  const lastTrained = new Map<string, string>();
  for (const s of sessions) {
    if (!lastTrained.has(s.workout_id)) {
      lastTrained.set(s.workout_id, s.started_at);
    }
  }

  const quickStart =
    sessions.length > 0
      ? [...workouts]
          .sort((a, b) => {
            const la = lastTrained.get(a.id);
            const lb = lastTrained.get(b.id);
            if (la && lb) return lb.localeCompare(la);
            if (la) return -1;
            if (lb) return 1;
            return a.created_at.localeCompare(b.created_at);
          })
          .slice(0, 5)
      : workouts.slice(0, 5);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <p className="text-sm text-neutral-400">Dashboard</p>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Hoi, {displayName} 👋
          </h1>
        </div>
        <DashboardMenu />
      </header>

      {profileError && (
        <div className="mt-4">
          <FormError message="Kon je profiel niet laden. Probeer de pagina te vernieuwen." />
        </div>
      )}

      <div className="mt-6">
        <WorkoutCalendar sessionByDate={sessionByDate} />
      </div>

      {quickStart.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-neutral-300">
            Snel starten
          </h2>
          <ul className="flex flex-col gap-2">
            {quickStart.map((workout) => (
              <li
                key={workout.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3"
              >
                <Link
                  href={`/workouts/${workout.id}`}
                  className="min-w-0 flex-1 truncate font-medium text-neutral-100 underline-offset-4 hover:underline"
                >
                  {workout.name}
                </Link>
                <QuickStartButton workoutId={workout.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <AppVersion />
    </main>
  );
}
