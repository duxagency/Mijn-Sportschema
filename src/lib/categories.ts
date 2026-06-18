/**
 * De categorieën waarin een oefening valt. Eén bron van waarheid voor de
 * keuze in het formulier, de groepering in de bibliotheek en de check-
 * constraint in de database (migration 20260618120000).
 *
 * De `key` is wat in de kolom `exercises.category` staat; de `label` tonen we.
 */
export type CategoryKey =
  | "kracht"
  | "push"
  | "pull"
  | "benen"
  | "cardio"
  | "overig";

export const CATEGORIES: readonly { key: CategoryKey; label: string }[] = [
  { key: "kracht", label: "Kracht" },
  { key: "push", label: "Push" },
  { key: "pull", label: "Pull" },
  { key: "benen", label: "Benen" },
  { key: "cardio", label: "Cardio" },
  { key: "overig", label: "Overig" },
] as const;

export const DEFAULT_CATEGORY: CategoryKey = "overig";

const CATEGORY_KEYS = new Set(CATEGORIES.map((c) => c.key));

/** Valideert of een willekeurige string een geldige categorie-key is. */
export function isCategoryKey(value: string): value is CategoryKey {
  return CATEGORY_KEYS.has(value as CategoryKey);
}

/** Het label bij een categorie-key; valt terug op "Overig" bij onbekend. */
export function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label ?? "Overig";
}
