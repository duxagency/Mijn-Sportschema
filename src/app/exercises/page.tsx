import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";
import { ExerciseLibrary } from "@/components/exercises/ExerciseLibrary";

export default async function ExercisesPage() {
  const supabase = await createClient();
  const { data: exercises, error } = await supabase
    .from("exercises")
    .select("*")
    .order("name", { ascending: true });

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
          >
            ← Dashboard
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-neutral-100">
            Oefeningen
          </h1>
          <p className="text-sm text-neutral-400">
            De gedeelde bibliotheek. Iedereen kan oefeningen toevoegen en
            aanpassen.
          </p>
        </div>
        <Link href="/exercises/new">
          <Button>Nieuwe oefening</Button>
        </Link>
      </header>

      {error ? (
        <div className="mt-6">
          <FormError message="Kon de oefeningen niet laden. Probeer de pagina te vernieuwen." />
        </div>
      ) : exercises && exercises.length > 0 ? (
        <ExerciseLibrary exercises={exercises} />
      ) : (
        <p className="mt-10 text-center text-sm text-neutral-400">
          Nog geen oefeningen. Maak de eerste aan met{" "}
          <span className="text-neutral-200">Nieuwe oefening</span>.
        </p>
      )}
    </main>
  );
}
