"use client";

import { useMemo, useState } from "react";
import type { Tables } from "@/types/database.types";
import { CATEGORIES, DEFAULT_CATEGORY, isCategoryKey } from "@/lib/categories";
import { Input } from "@/components/ui/Input";
import { ExerciseListItem } from "./ExerciseListItem";

/**
 * Doorzoekbare, per categorie gegroepeerde oefeningenlijst. Krijgt de volledige
 * lijst van de server en filtert + groepeert client-side, zodat zoeken direct
 * reageert zonder extra requests.
 */
export function ExerciseLibrary({
  exercises,
}: {
  exercises: Tables<"exercises">[];
}) {
  const [query, setQuery] = useState("");

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

  return (
    <div className="mt-6 flex flex-col gap-6">
      <Input
        label="Zoeken"
        name="exercise-search"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Zoek een oefening op naam…"
      />

      {total === 0 ? (
        <p className="mt-4 text-center text-sm text-neutral-400">
          Geen oefeningen gevonden voor “{query.trim()}”.
        </p>
      ) : (
        groups.map((group) => (
          <section key={group.category.key}>
            <h2 className="mb-3 flex items-baseline gap-2 text-sm font-medium text-neutral-300">
              {group.category.label}
              <span className="text-xs text-neutral-500">
                {group.items.length}
              </span>
            </h2>
            <ul className="flex flex-col gap-3">
              {group.items.map((exercise) => (
                <ExerciseListItem key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
