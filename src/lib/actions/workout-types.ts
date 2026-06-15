// Gedeelde types/constanten voor de workout-actions. Apart van workouts.ts
// omdat een "use server"-bestand alleen async functies mag exporteren.

export type WorkoutFormState = {
  error: string | null;
};

export const initialWorkoutFormState: WorkoutFormState = { error: null };
