import { AuthCard } from "@/components/auth/AuthCard";
import { LoginForm } from "@/components/auth/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <AuthCard
      title="Inloggen"
      subtitle="Welkom terug. Log in om verder te trainen."
      footer={{
        prompt: "Nog geen account?",
        linkLabel: "Registreer hier",
        href: "/register",
      }}
    >
      {message === "confirm-email" && (
        <p className="mb-4 rounded-md border border-emerald-900/60 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300">
          Je account is aangemaakt. Bevestig je e-mailadres via de link in je
          inbox en log daarna in.
        </p>
      )}
      <LoginForm />
    </AuthCard>
  );
}
