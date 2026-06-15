import Link from "next/link";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: {
    prompt: string;
    linkLabel: string;
    href: string;
  };
};

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-xl border border-neutral-800 bg-neutral-950 p-6 shadow-xl">
        <h1 className="text-xl font-semibold text-neutral-100">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-neutral-400">{subtitle}</p>
        {children}
        <p className="mt-6 text-center text-sm text-neutral-400">
          {footer.prompt}{" "}
          <Link
            href={footer.href}
            className="font-medium text-neutral-100 underline-offset-4 hover:underline"
          >
            {footer.linkLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
