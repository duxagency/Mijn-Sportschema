"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { METRICS } from "@/lib/metrics";
import type { ExerciseFormState } from "@/lib/actions/exercise-types";

type ParsedForm = {
  name: string;
  metrics: Record<(typeof METRICS)[number]["key"], boolean>;
};

/** Leest naam + metric-checkboxes uit het formulier en valideert de invoer. */
function parseAndValidate(
  formData: FormData,
): { ok: true; data: ParsedForm } | { ok: false; error: string } {
  const name = String(formData.get("name") ?? "").trim();

  const metrics = Object.fromEntries(
    METRICS.map((metric) => [metric.key, formData.has(metric.key)]),
  ) as ParsedForm["metrics"];

  if (!name) {
    return { ok: false, error: "Geef de oefening een naam." };
  }
  if (!Object.values(metrics).some(Boolean)) {
    return { ok: false, error: "Vink minstens één metric aan." };
  }

  return { ok: true, data: { name, metrics } };
}

export async function createExercise(
  _prev: ExerciseFormState,
  formData: FormData,
): Promise<ExerciseFormState> {
  const parsed = parseAndValidate(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("exercises").insert({
    name: parsed.data.name,
    created_by: user?.id ?? null,
    ...parsed.data.metrics,
  });

  if (error) {
    return { error: "Aanmaken mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/exercises");
  redirect("/exercises");
}

export async function updateExercise(
  id: string,
  _prev: ExerciseFormState,
  formData: FormData,
): Promise<ExerciseFormState> {
  const parsed = parseAndValidate(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("exercises")
    .update({ name: parsed.data.name, ...parsed.data.metrics })
    .eq("id", id);

  if (error) {
    return { error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/exercises");
  redirect("/exercises");
}

export async function deleteExercise(
  id: string,
  _prev: ExerciseFormState,
  _formData: FormData,
): Promise<ExerciseFormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("exercises").delete().eq("id", id);

  if (error) {
    // 23503 = foreign_key_violation: de oefening zit nog in een schema
    // (workout_exercises.exercise_id is ON DELETE RESTRICT).
    if (error.code === "23503") {
      return {
        error:
          "Deze oefening wordt nog in een of meer schema's gebruikt en kan niet verwijderd worden.",
      };
    }
    return { error: "Verwijderen mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/exercises");
  return { error: null };
}
