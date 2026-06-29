// Gedeelde types/constanten voor de session-actions. Apart van sessions.ts
// omdat een "use server"-bestand alleen async functies mag exporteren.

import type { MeasurementKey } from "@/lib/measurements";

export type SessionFormState = {
  error: string | null;
};

export const initialSessionFormState: SessionFormState = { error: null };

/**
 * Eén ingevoerde set zoals de client hem doorstuurt: per meetwaarde een
 * losse string ("" = leeg), plus of het een warming-up-set is. De server
 * parset en valideert deze waarden.
 */
export type SetInput = Record<MeasurementKey, string> & { warmup: boolean };

/** Een lege set-rij (alle velden leeg, geen warming-up). */
export const EMPTY_SET: SetInput = {
  reps: "",
  weight: "",
  minutes: "",
  distance: "",
  warmup: false,
};

/** De sets van één oefening binnen een sessie. */
export type ExerciseSets = {
  workoutExerciseId: string;
  sets: SetInput[];
};
