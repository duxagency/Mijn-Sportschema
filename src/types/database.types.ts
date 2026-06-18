// Types die het Supabase-schema weerspiegelen.
//
// Dit bestand is met de hand geschreven in het formaat dat de Supabase CLI
// genereert. Zodra je project gekoppeld is, regenereer je het met:
//
//   npm run gen:types
//
// (zie README). Bewerk de database via migrations, niet dit bestand met de hand.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          created_by: string | null;
          tracks_weight: boolean;
          tracks_reps: boolean;
          tracks_time: boolean;
          tracks_distance: boolean;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_by?: string | null;
          tracks_weight?: boolean;
          tracks_reps?: boolean;
          tracks_time?: boolean;
          tracks_distance?: boolean;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_by?: string | null;
          tracks_weight?: boolean;
          tracks_reps?: boolean;
          tracks_time?: boolean;
          tracks_distance?: boolean;
          category?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_id: string;
          exercise_id: string;
          position: number;
          target_sets: number | null;
          target_reps: number | null;
          target_weight: number | null;
          target_minutes: number | null;
          target_distance: number | null;
        };
        Insert: {
          id?: string;
          workout_id: string;
          exercise_id: string;
          position: number;
          target_sets?: number | null;
          target_reps?: number | null;
          target_weight?: number | null;
          target_minutes?: number | null;
          target_distance?: number | null;
        };
        Update: {
          id?: string;
          workout_id?: string;
          exercise_id?: string;
          position?: number;
          target_sets?: number | null;
          target_reps?: number | null;
          target_weight?: number | null;
          target_minutes?: number | null;
          target_distance?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_id_fkey";
            columns: ["workout_id"];
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
      };
      sessions: {
        Row: {
          id: string;
          user_id: string;
          workout_id: string;
          started_at: string;
          finished_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_id: string;
          started_at?: string;
          finished_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          workout_id?: string;
          started_at?: string;
          finished_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "sessions_workout_id_fkey";
            columns: ["workout_id"];
            referencedRelation: "workouts";
            referencedColumns: ["id"];
          }
        ];
      };
      session_sets: {
        Row: {
          id: string;
          session_id: string;
          workout_exercise_id: string;
          set_number: number;
          reps: number | null;
          weight: number | null;
          minutes: number | null;
          distance: number | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          workout_exercise_id: string;
          set_number: number;
          reps?: number | null;
          weight?: number | null;
          minutes?: number | null;
          distance?: number | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          workout_exercise_id?: string;
          set_number?: number;
          reps?: number | null;
          weight?: number | null;
          minutes?: number | null;
          distance?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "session_sets_session_id_fkey";
            columns: ["session_id"];
            referencedRelation: "sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_sets_workout_exercise_id_fkey";
            columns: ["workout_exercise_id"];
            referencedRelation: "workout_exercises";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<never, never>;
    Functions: {
      delete_user: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
