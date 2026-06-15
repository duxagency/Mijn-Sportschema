"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { TARGET_FIELDS, type TargetKey } from "@/lib/targets";
import type { WorkoutFormState } from "@/lib/actions/workout-types";

// ---------------------------------------------------------------------------
// Schema's (workouts)
// ---------------------------------------------------------------------------

export async function createWorkout(
  _prev: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { error: "Geef je schema een naam." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Je bent niet (meer) ingelogd." };
  }

  const { data, error } = await supabase
    .from("workouts")
    .insert({ name, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Aanmaken mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/workouts");
  redirect(`/workouts/${data.id}`);
}

export async function deleteWorkout(
  id: string,
  _prev: WorkoutFormState,
  _formData: FormData,
): Promise<WorkoutFormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("workouts").delete().eq("id", id);

  if (error) {
    return { error: "Verwijderen mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/workouts");
  redirect("/workouts");
}

// ---------------------------------------------------------------------------
// Oefeningen binnen een schema (workout_exercises)
// ---------------------------------------------------------------------------

export async function addExerciseToWorkout(
  workoutId: string,
  _prev: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const exerciseId = String(formData.get("exercise_id") ?? "");
  if (!exerciseId) {
    return { error: "Kies een oefening om toe te voegen." };
  }

  const supabase = await createClient();

  // Nieuwe oefening komt achteraan: position = huidige max + 1.
  const { data: last } = await supabase
    .from("workout_exercises")
    .select("position")
    .eq("workout_id", workoutId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextPosition = (last?.position ?? 0) + 1;

  const { error } = await supabase.from("workout_exercises").insert({
    workout_id: workoutId,
    exercise_id: exerciseId,
    position: nextPosition,
  });

  if (error) {
    return { error: "Toevoegen mislukt. Probeer het opnieuw." };
  }

  revalidatePath(`/workouts/${workoutId}`);
  return { error: null };
}

export async function removeWorkoutExercise(
  workoutExerciseId: string,
  workoutId: string,
  _prev: WorkoutFormState,
  _formData: FormData,
): Promise<WorkoutFormState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_exercises")
    .delete()
    .eq("id", workoutExerciseId);

  if (error) {
    return { error: "Verwijderen mislukt. Probeer het opnieuw." };
  }

  revalidatePath(`/workouts/${workoutId}`);
  return { error: null };
}

// ---------------------------------------------------------------------------
// Targets per oefening
// ---------------------------------------------------------------------------

/** Parset en valideert de target-velden uit het formulier. */
function parseTargets(
  formData: FormData,
): { ok: true; data: Record<TargetKey, number | null> } | {
  ok: false;
  error: string;
} {
  const result = {} as Record<TargetKey, number | null>;

  for (const field of TARGET_FIELDS) {
    const raw = String(formData.get(field.key) ?? "").trim();

    if (raw === "") {
      result[field.key] = null;
      continue;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return {
        ok: false,
        error: `${field.label} moet een getal van 0 of hoger zijn.`,
      };
    }
    if (field.integer && !Number.isInteger(value)) {
      return { ok: false, error: `${field.label} moet een heel getal zijn.` };
    }

    result[field.key] = value;
  }

  return { ok: true, data: result };
}

export async function updateTargets(
  workoutExerciseId: string,
  workoutId: string,
  _prev: WorkoutFormState,
  formData: FormData,
): Promise<WorkoutFormState> {
  const parsed = parseTargets(formData);
  if (!parsed.ok) {
    return { error: parsed.error };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("workout_exercises")
    .update(parsed.data)
    .eq("id", workoutExerciseId);

  if (error) {
    return { error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  revalidatePath(`/workouts/${workoutId}`);
  return { error: null };
}
