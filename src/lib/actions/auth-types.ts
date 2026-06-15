// Gedeelde types/constanten voor de auth-actions. Apart van auth.ts omdat
// een "use server"-bestand alleen async functies mag exporteren.

export type AuthState = {
  error: string | null;
};

export const initialAuthState: AuthState = { error: null };
