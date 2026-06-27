"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/types/database.types";
import type { TargetKey } from "@/lib/targets";
import type { MeasurementKey } from "@/lib/measurements";
import {
  EMPTY_SET,
  type ExerciseSets,
  type SetInput,
} from "@/lib/actions/session-types";
import { finishSession, saveExerciseSets } from "@/lib/actions/sessions";
import { updateExerciseNote } from "@/lib/actions/workouts";
import { FormError } from "@/components/ui/FormError";
import { ExerciseStep } from "./ExerciseStep";
import { DeleteSessionButton } from "./DeleteSessionButton";
import { RestTimer } from "./RestTimer";
import { NoteEditor } from "@/components/workouts/NoteEditor";

export type FlowExercise = {
  workoutExerciseId: string;
  exercise: Tables<"exercises">;
  targets: Record<TargetKey, number | null>;
  note: string | null;
  initialSets: SetInput[];
};

/** Heeft minstens één veld van één set een waarde? */
function hasData(rows: SetInput[]): boolean {
  return rows.some((row) => Object.values(row).some((v) => v.trim() !== ""));
}

export function TrainingFlow({
  sessionId,
  workoutId,
  workoutName,
  exercises,
}: {
  sessionId: string;
  workoutId: string;
  workoutName: string;
  exercises: FlowExercise[];
}) {
  const router = useRouter();

  const [rowsByExercise, setRowsByExercise] = useState<
    Record<string, SetInput[]>
  >(() =>
    Object.fromEntries(
      exercises.map((e) => [
        e.workoutExerciseId,
        e.initialSets.map((set) => ({ ...set })),
      ]),
    ),
  );
  // Snapshot van wat er is opgeslagen, om "niet-opgeslagen wijzigingen" te zien.
  const [snapshot, setSnapshot] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      exercises.map((e) => [
        e.workoutExerciseId,
        JSON.stringify(e.initialSets),
      ]),
    ),
  );
  // Notities per oefening (state in de flow zodat ze blijven bij navigeren).
  const [notesByExercise, setNotesByExercise] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(
        exercises.map((e) => [e.workoutExerciseId, e.note ?? ""]),
      ),
  );
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(exercises.map((e) => [e.workoutExerciseId, e.note ?? ""])),
  );
  const [noteError, setNoteError] = useState<string | null>(null);

  const [index, setIndex] = useState(0);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [finishError, setFinishError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [finishing, startFinishing] = useTransition();
  const [savingNote, startSavingNote] = useTransition();

  if (exercises.length === 0) {
    return (
      <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
        <p className="text-neutral-300">
          Dit schema heeft geen oefeningen. Voeg eerst oefeningen toe.
        </p>
        <div className="mt-4">
          <DeleteSessionButton
            sessionId={sessionId}
            label="Training afbreken"
            confirmText="Deze training afbreken?"
          />
        </div>
      </main>
    );
  }

  const current = exercises[index];
  const rows = rowsByExercise[current.workoutExerciseId];
  const dirty =
    JSON.stringify(rows) !== snapshot[current.workoutExerciseId];
  const isFirst = index === 0;
  const isLast = index === exercises.length - 1;

  function mutateRows(updater: (rows: SetInput[]) => SetInput[]) {
    const weId = current.workoutExerciseId;
    setRowsByExercise((prev) => ({ ...prev, [weId]: updater(prev[weId]) }));
    setSaveError(null);
  }

  function addSet() {
    mutateRows((rows) => [...rows, { ...EMPTY_SET }]);
  }

  function removeSet(target: number) {
    mutateRows((rows) => rows.filter((_, i) => i !== target));
  }

  function changeCell(target: number, key: MeasurementKey, value: string) {
    mutateRows((rows) =>
      rows.map((row, i) => (i === target ? { ...row, [key]: value } : row)),
    );
  }

  function save() {
    const weId = current.workoutExerciseId;
    const rowsNow = rowsByExercise[weId];
    setSaveError(null);
    startSaving(async () => {
      const result = await saveExerciseSets(sessionId, weId, rowsNow);
      if (result.error) {
        setSaveError(result.error);
      } else {
        setSnapshot((prev) => ({ ...prev, [weId]: JSON.stringify(rowsNow) }));
      }
    });
  }

  function changeNote(value: string) {
    const weId = current.workoutExerciseId;
    setNotesByExercise((prev) => ({ ...prev, [weId]: value }));
    setNoteError(null);
  }

  function saveNote() {
    const weId = current.workoutExerciseId;
    const noteNow = notesByExercise[weId];
    setNoteError(null);
    startSavingNote(async () => {
      const result = await updateExerciseNote(weId, workoutId, noteNow);
      if (result.error) {
        setNoteError(result.error);
      } else {
        setSavedNotes((prev) => ({ ...prev, [weId]: noteNow }));
      }
    });
  }

  function goTo(next: number) {
    setSaveError(null);
    setFinishError(null);
    setNoteError(null);
    setIndex(next);
    window.scrollTo({ top: 0 });
  }

  function finish() {
    if (!confirm("Training afronden?")) return;
    setFinishError(null);
    const allSets: ExerciseSets[] = exercises.map((e) => ({
      workoutExerciseId: e.workoutExerciseId,
      sets: rowsByExercise[e.workoutExerciseId],
    }));
    startFinishing(async () => {
      const result = await finishSession(sessionId, allSets);
      if (result.error) {
        setFinishError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 pb-40">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <p className="text-sm text-neutral-400">Training bezig</p>
          <h1 className="text-xl font-semibold text-neutral-100">
            {workoutName}
          </h1>
        </div>
        <DeleteSessionButton
          sessionId={sessionId}
          label="Afbreken"
          confirmText="Deze training afbreken? Je verliest de ingevoerde sets."
        />
      </header>

      <p className="mt-4 text-sm text-neutral-400">
        Oefening {index + 1} / {exercises.length}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full bg-neutral-300 transition-all"
          style={{ width: `${((index + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="mt-5 flex flex-col gap-4">
        <ExerciseStep
          key={current.workoutExerciseId}
          exercise={current.exercise}
          targets={current.targets}
          rows={rows}
          onAddSet={addSet}
          onRemoveSet={removeSet}
          onCellChange={changeCell}
          onSave={save}
          saving={saving}
          dirty={dirty}
          saved={hasData(rows)}
          error={saveError}
        />
        <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
          <NoteEditor
            id={`note-${current.workoutExerciseId}`}
            value={notesByExercise[current.workoutExerciseId]}
            onChange={changeNote}
            onSave={saveNote}
            pending={savingNote}
            dirty={
              notesByExercise[current.workoutExerciseId].trim() !==
              savedNotes[current.workoutExerciseId].trim()
            }
            error={noteError}
          />
        </section>
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto mb-2 flex max-w-2xl items-center justify-center overflow-x-auto">
          <RestTimer />
        </div>
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            disabled={isFirst}
            className="flex-1 rounded-lg border border-neutral-700 px-4 py-3 text-base font-medium text-neutral-200 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Vorige
          </button>
          {isLast ? (
            <button
              type="button"
              onClick={finish}
              disabled={finishing}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 text-base font-semibold text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {finishing ? "Afronden…" : "Training afronden"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 text-base font-semibold text-neutral-900 transition hover:bg-white"
            >
              Volgende →
            </button>
          )}
        </div>
        {finishError && (
          <div className="mx-auto max-w-2xl pt-2">
            <FormError message={finishError} />
          </div>
        )}
      </footer>
    </main>
  );
}
