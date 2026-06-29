"use client";

import { useMemo, useState } from "react";
import type { Tables } from "@/types/database.types";
import {
  CATEGORIES,
  DEFAULT_CATEGORY,
  isCategoryKey,
  type CategoryKey,
} from "@/lib/categories";
import { Input } from "@/components/ui/Input";
import { ExerciseListItem } from "./ExerciseListItem";

/** Onbekende of ontbrekende categorie valt onder "Overig". */
function effectiveCategory(value: string | null | undefined): CategoryKey {
  return value && isCategoryKey(value) ? value : DEFAULT_CATEGORY;
}

/**
 * Doorzoekbare, per categorie gegroepeerde oefeningenlijst met filterchips.
 * Krijgt de volledige lijst van de server en filtert client-side, zodat zoeken
 * en filteren direct reageren zonder extra requests.
 */
export function ExerciseLibrary({
  exercises,
}: {
  exercises: Tables<"exercises">[];
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryKey | "all">("all");

  const term = query.trim().toLowerCase();

  // Categorieën die daadwerkelijk oefeningen bevatten, voor de filterchips.
  const availableCategories = useMemo(
    () =>
      CATEGORIES.filter((category) =>
        exercises.some((e) => effectiveCategory(e.category) === category.key),
      ),
    [exercises],
  );

  const groups = useMemo(() => {
    const matched = term
      ? exercises.filter((e) => e.name.toLowerCase().includes(term))
      : exercises;

    return CATEGORIES.filter(
      (category) => filter === "all" || category.key === filter,
    )
      .map((category) => ({
        category,
        items: matched.filter(
          (e) => effectiveCategory(e.category) === category.key,
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [exercises, term, filter]);

  const total = groups.reduce((sum, group) => sum + group.items.length, 0);

  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3 py-1.5 text-sm transition ${
      active
        ? "border-neutral-500 bg-neutral-800 text-neutral-100"
        : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
    }`;

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

      {availableCategories.length > 1 && (
        <div className="-mt-2 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={chip(filter === "all")}
          >
            Alle
          </button>
          {availableCategories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => setFilter(category.key)}
              className={chip(filter === category.key)}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}

      {total === 0 ? (
        <p className="mt-4 text-center text-sm text-neutral-400">
          {term
            ? `Geen oefeningen gevonden voor “${query.trim()}”.`
            : "Geen oefeningen in deze categorie."}
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
