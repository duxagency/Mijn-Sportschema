import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdateNameForm } from "@/components/account/UpdateNameForm";
import { UpdatePasswordForm } from "@/components/account/UpdatePasswordForm";
import { UpdateEmailForm } from "@/components/account/UpdateEmailForm";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";

export default async function AccountPage() {
  const supabase = await createClient();
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
    .maybeSingle();

  const metadataName = user.user_metadata?.display_name as string | undefined;
  const currentName = profile?.display_name ?? metadataName ?? "";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Link
          href="/dashboard"
          className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
        >
          ← Dashboard
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-100">Account</h1>
        <p className="text-sm text-neutral-400">Beheer je gegevens.</p>
      </header>

      <div className="mt-6 flex flex-col gap-6">
        <Section title="Naam">
          <UpdateNameForm currentName={currentName} />
        </Section>

        <Section title="Wachtwoord">
          <UpdatePasswordForm />
        </Section>

        <Section title="E-mailadres">
          <UpdateEmailForm currentEmail={user.email ?? ""} />
        </Section>

        <Section title="Account verwijderen" danger>
          <p className="mb-4 text-sm text-neutral-400">
            Dit verwijdert je account en al je gegevens permanent. Dit kan niet
            ongedaan gemaakt worden.
          </p>
          <DeleteAccountButton />
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  danger = false,
  children,
}: {
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-xl border bg-neutral-950 p-5 ${
        danger ? "border-red-900/50" : "border-neutral-800"
      }`}
    >
      <h2
        className={`mb-4 text-sm font-medium ${
          danger ? "text-red-300" : "text-neutral-300"
        }`}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
