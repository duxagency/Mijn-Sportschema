import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateExercise } from "@/lib/actions/exercises";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { METRICS } from "@/lib/metrics";

export default async function EditExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const { data: exercise } = await supabase
    .from("exercises")
    .select("*")
    .eq("id", id)
    .single();

  if (!exercise) {
    notFound();
  }

  const metrics = Object.fromEntries(
    METRICS.map((metric) => [metric.key, exercise[metric.key]]),
  ) as Record<(typeof METRICS)[number]["key"], boolean>;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <Link
        href="/exercises"
        className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
      >
        ← Oefeningen
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-semibold text-neutral-100">
        Oefening wijzigen
      </h1>
      <ExerciseForm
        action={updateExercise.bind(null, exercise.id)}
        submitLabel="Opslaan"
        defaultValues={{
          name: exercise.name,
          category: exercise.category,
          metrics,
        }}
      />
    </main>
  );
}
