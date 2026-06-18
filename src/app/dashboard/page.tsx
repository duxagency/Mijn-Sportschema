import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { FormError } from "@/components/ui/FormError";
import { AppVersion } from "@/components/ui/AppVersion";
import { QuickStartButton } from "@/components/sessions/QuickStartButton";

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

  // Schema's voor de "snel starten"-sectie: maximaal 5, gesorteerd op de meest
  // recente training. Zonder enige training tonen we de eerst gemaakte schema's.
  const [{ data: workoutsData }, { data: sessionsData }] = await Promise.all([
    supabase
      .from("workouts")
      .select("id, name, created_at")
      .order("created_at", { ascending: true }),
    supabase
      .from("sessions")
      .select("workout_id, started_at")
      .order("started_at", { ascending: false }),
  ]);

  const workouts = workoutsData ?? [];
  const sessions = sessionsData ?? [];

  // Eerste keer dat een workout_id voorkomt = de meest recente sessie (desc).
  const lastTrained = new Map<string, string>();
  for (const s of sessions) {
    if (!lastTrained.has(s.workout_id)) lastTrained.set(s.workout_id, s.started_at);
  }

  const quickStart =
    sessions.length > 0
      ? [...workouts]
          .sort((a, b) => {
            const la = lastTrained.get(a.id);
            const lb = lastTrained.get(b.id);
            if (la && lb) return lb.localeCompare(la); // recentst eerst
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
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/account"
            className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
          >
            Account
          </Link>
          <SignOutButton />
        </div>
      </header>

      {profileError && (
        <div className="mt-4">
          <FormError message="Kon je profiel niet laden. Probeer de pagina te vernieuwen." />
        </div>
      )}

      <section className="mt-8 flex flex-col gap-4">
        <DashboardCard
          href="/workouts"
          title="Mijn schema's"
          description="Bouw en beheer je eigen trainingsschema's."
          icon={
            <>
              <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
              <path d="M12 11h4" />
              <path d="M12 16h4" />
              <path d="M8 11h.01" />
              <path d="M8 16h.01" />
            </>
          }
        />
        <DashboardCard
          href="/exercises"
          title="Oefeningenbibliotheek"
          description="Bekijk, voeg toe en beheer de gedeelde oefeningen."
          icon={
            <>
              <path d="m6.5 6.5 11 11" />
              <path d="m21 21-1-1" />
              <path d="m3 3 1 1" />
              <path d="m18 22 4-4" />
              <path d="m2 6 4-4" />
              <path d="m3 10 7-7" />
              <path d="m14 21 7-7" />
            </>
          }
        />
        <DashboardCard
          href="/sessions"
          title="Mijn trainingen"
          description="Bekijk je afgeronde trainingen en kijk ze terug."
          icon={
            <>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </>
          }
        />
      </section>

      {quickStart.length > 0 && (
        <section className="mt-10">
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

function DashboardCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950 p-5 transition hover:border-neutral-600"
    >
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-5"
          aria-hidden="true"
        >
          {icon}
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-medium text-neutral-100">{title}</h2>
        <p className="mt-1 text-sm text-neutral-400">{description}</p>
      </div>
      <span aria-hidden="true" className="shrink-0 text-neutral-500">
        →
      </span>
    </Link>
  );
}
