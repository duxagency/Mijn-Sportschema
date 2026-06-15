import Link from "next/link";
import { createExercise } from "@/lib/actions/exercises";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";

export default function NewExercisePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <Link
        href="/exercises"
        className="text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
      >
        ← Oefeningen
      </Link>
      <h1 className="mt-1 mb-6 text-2xl font-semibold text-neutral-100">
        Nieuwe oefening
      </h1>
      <ExerciseForm action={createExercise} submitLabel="Aanmaken" />
    </main>
  );
}
