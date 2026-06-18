"use client";

import { useActionState, useMemo, useRef, useState } from "react";
import { addExerciseToWorkout } from "@/lib/actions/workouts";
import { initialWorkoutFormState } from "@/lib/actions/workout-types";
import type { Tables } from "@/types/database.types";
import { CATEGORIES, DEFAULT_CATEGORY, isCategoryKey } from "@/lib/categories";
import { Input } from "@/components/ui/Input";
import { FormError } from "@/components/ui/FormError";

type PickerExercise = Pick<Tables<"exercises">, "id" | "name" | "category">;

export function AddExerciseForm({
  workoutId,
  exercises,
}: {
  workoutId: string;
  exercises: PickerExercise[];
}) {
  const [state, formAction, pending] = useActionState(
    addExerciseToWorkout.bind(null, workoutId),
    initialWorkoutFormState,
  );
  const [query, setQuery] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const hiddenRef = useRef<HTMLInputElement>(null);

  const term = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const matched = term
      ? exercises.filter((e) => e.name.toLowerCase().includes(term))
      : exercises;

    // Onbekende of (vóór de migratie) ontbrekende categorie valt onder "Overig".
    const effectiveCategory = (value: string | null | undefined) =>
      value && isCategoryKey(value) ? value : DEFAULT_CATEGORY;

    return CATEGORIES.map((category) => ({
      category,
      items: matched.filter(
        (e) => effectiveCategory(e.category) === category.key,
      ),
    })).filter((group) => group.items.length > 0);
  }, [exercises, term]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  // Eén tik = direct toevoegen: zet de verborgen waarde en submit synchroon,
  // zodat de FormData het juiste exercise_id bevat.
  function add(exerciseId: string) {
    if (pending) return;
    if (hiddenRef.current) hiddenRef.current.value = exerciseId;
    formRef.current?.requestSubmit();
  }

  if (exercises.length === 0) {
    return (
      <p className="text-sm text-neutral-400">
        Er zijn nog geen oefeningen in de bibliotheek. Maak er eerst een aan.
      </p>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input ref={hiddenRef} type="hidden" name="exercise_id" />

      <Input
        label="Oefening toevoegen"
        name="exercise-picker-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Zoek een oefening op naam…"
      />

      {total === 0 ? (
        <p className="text-sm text-neutral-400">
          Geen oefeningen gevonden voor “{query.trim()}”.
        </p>
      ) : (
        <div className="flex max-h-80 flex-col gap-4 overflow-y-auto pr-1">
          {groups.map((group) => (
            <section key={group.category.key}>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
                {group.category.label}
              </h3>
              <div className="flex flex-col gap-1.5">
                {group.items.map((exercise) => (
                  <button
                    key={exercise.id}
                    type="button"
                    onClick={() => add(exercise.id)}
                    disabled={pending}
                    className="flex items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-3 py-2.5 text-left text-sm text-neutral-100 transition hover:border-neutral-600 hover:bg-neutral-800 disabled:opacity-50"
                  >
                    <span>{exercise.name}</span>
                    <span className="shrink-0 text-lg leading-none text-neutral-500">
                      +
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <FormError message={state.error} />
    </form>
  );
}
