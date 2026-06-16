"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-xl font-semibold text-neutral-100">
        Er ging iets mis
      </h1>
      <p className="mt-2 text-sm text-neutral-400">
        Probeer het opnieuw. Blijft het mislukken, vernieuw dan de pagina.
      </p>
      <Button className="mt-6" onClick={reset}>
        Opnieuw proberen
      </Button>
    </main>
  );
}
