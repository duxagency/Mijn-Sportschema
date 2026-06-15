import { AuthCard } from "@/components/auth/AuthCard";
import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Account aanmaken"
      subtitle="Begin met het bouwen van je trainingsschema's."
      footer={{
        prompt: "Heb je al een account?",
        linkLabel: "Log hier in",
        href: "/login",
      }}
    >
      <RegisterForm />
    </AuthCard>
  );
}
