// Gedeelde types/constanten voor de exercise-actions. Apart van exercises.ts
// omdat een "use server"-bestand alleen async functies mag exporteren.

export type ExerciseFormState = {
  error: string | null;
};

export const initialExerciseFormState: ExerciseFormState = { error: null };
