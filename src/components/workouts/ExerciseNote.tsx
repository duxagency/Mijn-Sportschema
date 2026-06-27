"use client";

import { useState, useTransition } from "react";
import { updateExerciseNote } from "@/lib/actions/workouts";
import { NoteEditor } from "./NoteEditor";

/**
 * Zelfstandige notitie-editor bij een oefening in een schema (schema-builder).
 * Slaat op via de workout_exercise, zodat de notitie bij dat schema blijft.
 */
export function ExerciseNote({
  workoutExerciseId,
  workoutId,
  initialNote,
}: {
  workoutExerciseId: string;
  workoutId: string;
  initialNote: string | null;
}) {
  const [note, setNote] = useState(initialNote ?? "");
  const [saved, setSaved] = useState(initialNote ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startSaving] = useTransition();

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await updateExerciseNote(workoutExerciseId, workoutId, note);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(note);
      }
    });
  }

  return (
    <NoteEditor
      id={`note-${workoutExerciseId}`}
      value={note}
      onChange={setNote}
      onSave={save}
      pending={pending}
      dirty={note.trim() !== saved.trim()}
      error={error}
    />
  );
}
