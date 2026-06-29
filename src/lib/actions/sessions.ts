"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { MEASUREMENTS } from "@/lib/measurements";
import type {
  ExerciseSets,
  SessionFormState,
  SetInput,
} from "@/lib/actions/session-types";

// ---------------------------------------------------------------------------
// Helpers (geen exports: een "use server"-bestand mag alleen async functies
// exporteren, maar lokale niet-geëxporteerde helpers mogen wel).
// ---------------------------------------------------------------------------

type ParsedSet = { reps: number | null } & {
  weight: number | null;
  minutes: number | null;
  distance: number | null;
};

/** Parset en valideert één set-rij volgens de metrics in MEASUREMENTS. */
function parseSetRow(
  input: SetInput,
): { ok: true; data: ParsedSet } | { ok: false; error: string } {
  const data: ParsedSet = {
    reps: null,
    weight: null,
    minutes: null,
    distance: null,
  };

  for (const measurement of MEASUREMENTS) {
    const raw = String(input[measurement.key] ?? "").trim();
    if (raw === "") continue;

    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) {
      return {
        ok: false,
        error: `${measurement.label} moet een getal van 0 of hoger zijn.`,
      };
    }
    if (measurement.integer && !Number.isInteger(value)) {
      return {
        ok: false,
        error: `${measurement.label} moet een heel getal zijn.`,
      };
    }
    data[measurement.key] = value;
  }

  return { ok: true, data };
}

/** Een rij zonder enkele ingevulde meetwaarde slaan we niet op. */
function isEmptyRow(data: ParsedSet): boolean {
  return MEASUREMENTS.every((measurement) => data[measurement.key] == null);
}

/** Controleert dat de sessie van de gebruiker is én nog niet afgerond. */
async function assertEditableSession(
  supabase: Awaited<ReturnType<typeof createClient>>,
  sessionId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data } = await supabase
    .from("sessions")
    .select("id, finished_at")
    .eq("id", sessionId)
    .maybeSingle();

  if (!data) return { ok: false, error: "Training niet gevonden." };
  if (data.finished_at) {
    return { ok: false, error: "Deze training is al afgerond." };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Een training starten
// ---------------------------------------------------------------------------

export async function startSession(
  workoutId: string,
  _prev: SessionFormState,
  _formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Je bent niet (meer) ingelogd." };
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ workout_id: workoutId, user_id: user.id })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Training starten mislukt. Probeer het opnieuw." };
  }

  redirect(`/sessions/${data.id}`);
}

// ---------------------------------------------------------------------------
// Sets opslaan tijdens de training
// ---------------------------------------------------------------------------

/**
 * Vervangt de opgeslagen sets van één oefening binnen een sessie. Eerst alles
 * valideren, dan pas de oude rijen wegschrijven, zodat een foute invoer niets
 * sloopt. Lege rijen worden overgeslagen en de set-nummers lopen door.
 */
export async function saveExerciseSets(
  sessionId: string,
  workoutExerciseId: string,
  sets: SetInput[],
): Promise<SessionFormState> {
  const supabase = await createClient();

  const editable = await assertEditableSession(supabase, sessionId);
  if (!editable.ok) return { error: editable.error };

  const rows: {
    session_id: string;
    workout_exercise_id: string;
    set_number: number;
    is_warmup: boolean;
  }[] = [];

  let setNumber = 0;
  for (const input of sets) {
    const parsed = parseSetRow(input);
    if (!parsed.ok) return { error: parsed.error };
    if (isEmptyRow(parsed.data)) continue;

    setNumber += 1;
    rows.push({
      session_id: sessionId,
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      is_warmup: input.warmup,
      ...parsed.data,
    });
  }

  const { error: deleteError } = await supabase
    .from("session_sets")
    .delete()
    .eq("session_id", sessionId)
    .eq("workout_exercise_id", workoutExerciseId);
  if (deleteError) {
    return { error: "Opslaan mislukt. Probeer het opnieuw." };
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("session_sets")
      .insert(rows);
    if (insertError) {
      return { error: "Opslaan mislukt. Probeer het opnieuw." };
    }
  }

  revalidatePath(`/sessions/${sessionId}`);
  return { error: null };
}

// ---------------------------------------------------------------------------
// Een training afronden
// ---------------------------------------------------------------------------

/**
 * Schrijft alle sets van de sessie weg (volledige vervanging vanuit de
 * client-state) en zet finished_at. Eén delete + één insert houdt het
 * consistent, ook als sommige oefeningen tussendoor niet los zijn opgeslagen.
 */
export async function finishSession(
  sessionId: string,
  allSets: ExerciseSets[],
): Promise<SessionFormState> {
  const supabase = await createClient();

  const editable = await assertEditableSession(supabase, sessionId);
  if (!editable.ok) return { error: editable.error };

  const rows: {
    session_id: string;
    workout_exercise_id: string;
    set_number: number;
    is_warmup: boolean;
  }[] = [];

  for (const exercise of allSets) {
    let setNumber = 0;
    for (const input of exercise.sets) {
      const parsed = parseSetRow(input);
      if (!parsed.ok) return { error: parsed.error };
      if (isEmptyRow(parsed.data)) continue;

      setNumber += 1;
      rows.push({
        session_id: sessionId,
        workout_exercise_id: exercise.workoutExerciseId,
        set_number: setNumber,
        is_warmup: input.warmup,
        ...parsed.data,
      });
    }
  }

  const { error: deleteError } = await supabase
    .from("session_sets")
    .delete()
    .eq("session_id", sessionId);
  if (deleteError) {
    return { error: "Afronden mislukt. Probeer het opnieuw." };
  }

  if (rows.length > 0) {
    const { error: insertError } = await supabase
      .from("session_sets")
      .insert(rows);
    if (insertError) {
      return { error: "Afronden mislukt. Probeer het opnieuw." };
    }
  }

  const { error: finishError } = await supabase
    .from("sessions")
    .update({ finished_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (finishError) {
    return { error: "Afronden mislukt. Probeer het opnieuw." };
  }

  revalidatePath(`/sessions/${sessionId}`);
  revalidatePath("/sessions");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Een training verwijderen (afbreken of uit de historie wissen)
// ---------------------------------------------------------------------------

export async function deleteSession(
  sessionId: string,
  _prev: SessionFormState,
  _formData: FormData,
): Promise<SessionFormState> {
  const supabase = await createClient();
  const { error } = await supabase.from("sessions").delete().eq("id", sessionId);

  if (error) {
    return { error: "Verwijderen mislukt. Probeer het opnieuw." };
  }

  revalidatePath("/sessions");
  redirect("/sessions");
}
