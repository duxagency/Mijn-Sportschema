import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default async function DashboardPage() {
  const supabase = await createClient();

  // Extra controle naast de middleware: zonder geldige gebruiker geen toegang.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

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

      <section className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <h2 className="text-lg font-medium text-neutral-100">
          Je bent ingelogd
        </h2>
        <p className="mt-2 text-sm text-neutral-400">
          De fundering staat. In een volgende fase bouwen we hier de
          schema-builder, trainingen en je voortgang.
        </p>
      </section>
    </main>
  );
}
