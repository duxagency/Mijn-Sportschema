import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { FormError } from "@/components/ui/FormError";

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

  const displayName = profile?.display_name ?? user.email ?? "sporter";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <p className="text-sm text-neutral-400">Dashboard</p>
          <h1 className="text-2xl font-semibold text-neutral-100">
            Hoi, {displayName} 👋
          </h1>
        </div>
        <SignOutButton />
      </header>

      {profileError && (
        <div className="mt-4">
          <FormError message="Kon je profiel niet laden. Probeer de pagina te vernieuwen." />
        </div>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link
          href="/workouts"
          className="block rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-neutral-600"
        >
          <h2 className="text-lg font-medium text-neutral-100">
            Mijn schema&apos;s →
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Bouw en beheer je eigen trainingsschema&apos;s.
          </p>
        </Link>
        <Link
          href="/exercises"
          className="block rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-neutral-600"
        >
          <h2 className="text-lg font-medium text-neutral-100">
            Oefeningenbibliotheek →
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Bekijk, voeg toe en beheer de gedeelde oefeningen.
          </p>
        </Link>
        <Link
          href="/sessions"
          className="block rounded-xl border border-neutral-800 bg-neutral-950 p-6 transition hover:border-neutral-600"
        >
          <h2 className="text-lg font-medium text-neutral-100">
            Mijn trainingen →
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Bekijk je afgeronde trainingen en kijk ze terug.
          </p>
        </Link>
      </section>
    </main>
  );
}
