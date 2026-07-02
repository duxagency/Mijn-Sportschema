"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Tables } from "@/types/database.types";
import type { TargetValues } from "@/lib/targets";
import type { MeasurementKey } from "@/lib/measurements";
import {
  EMPTY_SET,
  type ExerciseSets,
  type SetInput,
} from "@/lib/actions/session-types";
import Link from "next/link";
import {
  finishSession,
  saveExerciseSets,
  updateFinishedSession,
} from "@/lib/actions/sessions";
import { updateExerciseNote } from "@/lib/actions/workouts";
import { FormError } from "@/components/ui/FormError";
import { ExerciseStep, type PreviousSet } from "./ExerciseStep";
import { DeleteSessionButton } from "./DeleteSessionButton";
import { RestTimer } from "./RestTimer";
import { NoteEditor } from "@/components/workouts/NoteEditor";

export type FlowExercise = {
  workoutExerciseId: string;
  exercise: Tables<"exercises">;
  targets: TargetValues;
  note: string | null;
  combinedWithPrevious: boolean;
  restSeconds: number | null;
  previousSets: PreviousSet[];
  pr: { value: number; unit: string } | null;
  initialSets: SetInput[];
};

/** Heeft minstens één meetwaarde van één set een waarde? */
function hasData(rows: SetInput[]): boolean {
  return rows.some(
    (row) =>
      row.reps.trim() !== "" ||
      row.weight.trim() !== "" ||
      row.minutes.trim() !== "" ||
      row.distance.trim() !== "",
  );
}

/** Groepeert opeenvolgende gecombineerde oefeningen tot supersets. */
function buildGroups(exercises: FlowExercise[]): FlowExercise[][] {
  const groups: FlowExercise[][] = [];
  for (const exercise of exercises) {
    if (groups.length === 0 || !exercise.combinedWithPrevious) {
      groups.push([exercise]);
    } else {
      groups[groups.length - 1].push(exercise);
    }
  }
  return groups;
}

export function TrainingFlow({
  sessionId,
  workoutId,
  workoutName,
  exercises,
  mode = "active",
}: {
  sessionId: string;
  workoutId: string;
  workoutName: string;
  exercises: FlowExercise[];
  mode?: "active" | "edit";
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

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
      exercises.map((e) => [e.workoutExerciseId, JSON.stringify(e.initialSets)]),
    ),
  );
  // Notities per oefening (state in de flow zodat ze blijven bij navigeren).
  const [notesByExercise, setNotesByExercise] = useState<Record<string, string>>(
    () =>
      Object.fromEntries(exercises.map((e) => [e.workoutExerciseId, e.note ?? ""])),
  );
  const [savedNotes, setSavedNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(exercises.map((e) => [e.workoutExerciseId, e.note ?? ""])),
  );

  const [index, setIndex] = useState(0);
  const [saveError, setSaveError] = useState<{ id: string; message: string } | null>(
    null,
  );
  const [noteError, setNoteError] = useState<{ id: string; message: string } | null>(
    null,
  );
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

  const groups = buildGroups(exercises);
  const currentGroup = groups[index];
  const isFirst = index === 0;
  const isLast = index === groups.length - 1;

  function mutateRows(weId: string, updater: (rows: SetInput[]) => SetInput[]) {
    setRowsByExercise((prev) => ({ ...prev, [weId]: updater(prev[weId]) }));
    setSaveError(null);
  }

  function addSet(weId: string) {
    mutateRows(weId, (rows) => [...rows, { ...EMPTY_SET }]);
  }

  function removeSet(weId: string, target: number) {
    mutateRows(weId, (rows) => rows.filter((_, i) => i !== target));
  }

  function changeCell(
    weId: string,
    target: number,
    key: MeasurementKey,
    value: string,
  ) {
    mutateRows(weId, (rows) =>
      rows.map((row, i) => (i === target ? { ...row, [key]: value } : row)),
    );
  }

  function toggleWarmup(weId: string, target: number) {
    mutateRows(weId, (rows) =>
      rows.map((row, i) =>
        i === target ? { ...row, warmup: !row.warmup } : row,
      ),
    );
  }

  function copyPrevious(weId: string, previousSets: PreviousSet[]) {
    if (previousSets.length === 0) return;
    const toStr = (value: number | null) => (value == null ? "" : String(value));
    setRowsByExercise((prev) => ({
      ...prev,
      [weId]: previousSets.map((set) => ({
        reps: toStr(set.reps),
        weight: toStr(set.weight),
        minutes: toStr(set.minutes),
        distance: toStr(set.distance),
        warmup: false,
      })),
    }));
    setSaveError(null);
  }

  function save(weId: string) {
    const rowsNow = rowsByExercise[weId];
    setSaveError(null);
    startSaving(async () => {
      const result = await saveExerciseSets(sessionId, weId, rowsNow);
      if (result.error) {
        setSaveError({ id: weId, message: result.error });
      } else {
        setSnapshot((prev) => ({ ...prev, [weId]: JSON.stringify(rowsNow) }));
      }
    });
  }

  function changeNote(weId: string, value: string) {
    setNotesByExercise((prev) => ({ ...prev, [weId]: value }));
    setNoteError(null);
  }

  function saveNote(weId: string) {
    const noteNow = notesByExercise[weId];
    setNoteError(null);
    startSavingNote(async () => {
      const result = await updateExerciseNote(weId, workoutId, noteNow);
      if (result.error) {
        setNoteError({ id: weId, message: result.error });
      } else {
        setSavedNotes((prev) => ({ ...prev, [weId]: noteNow }));
      }
    });
  }

  function goTo(next: number) {
    setSaveError(null);
    setNoteError(null);
    setFinishError(null);
    setIndex(next);
    window.scrollTo({ top: 0 });
  }

  // "Volgende" slaat eerst de sets van de huidige (superset-)stap op en
  // navigeert daarna pas. Bij een fout blijven we op de huidige stap.
  function goNext() {
    // In edit-modus slaan we niet per stap op (dat gaat via "Wijzigingen
    // opslaan"); gewoon navigeren.
    if (isEdit) {
      goTo(index + 1);
      return;
    }
    const group = currentGroup;
    const nextIndex = index + 1;
    setSaveError(null);
    startSaving(async () => {
      for (const ex of group) {
        const weId = ex.workoutExerciseId;
        const rowsNow = rowsByExercise[weId];
        const result = await saveExerciseSets(sessionId, weId, rowsNow);
        if (result.error) {
          setSaveError({ id: weId, message: result.error });
          return;
        }
        setSnapshot((prev) => ({ ...prev, [weId]: JSON.stringify(rowsNow) }));
      }
      goTo(nextIndex);
    });
  }

  function finish() {
    if (!isEdit && !confirm("Training afronden?")) return;
    setFinishError(null);
    const allSets: ExerciseSets[] = exercises.map((e) => ({
      workoutExerciseId: e.workoutExerciseId,
      sets: rowsByExercise[e.workoutExerciseId],
    }));
    startFinishing(async () => {
      const result = isEdit
        ? await updateFinishedSession(sessionId, allSets)
        : await finishSession(sessionId, allSets);
      if (result.error) {
        setFinishError(result.error);
      } else if (isEdit) {
        router.push(`/sessions/${sessionId}`);
        router.refresh();
      } else {
        router.refresh();
      }
    });
  }

  const isSuperset = currentGroup.length > 1;
  const suggestedRest =
    currentGroup.find((e) => e.restSeconds != null)?.restSeconds ?? null;

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-8 pb-40">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-4">
        <div>
          <p className="text-sm text-neutral-400">
            {isEdit ? "Training aanpassen" : "Training bezig"}
          </p>
          <h1 className="text-xl font-semibold text-neutral-100">
            {workoutName}
          </h1>
        </div>
        {isEdit ? (
          <Link
            href={`/sessions/${sessionId}`}
            className="shrink-0 text-sm text-neutral-400 underline-offset-4 hover:text-neutral-200 hover:underline"
          >
            Annuleren
          </Link>
        ) : (
          <DeleteSessionButton
            sessionId={sessionId}
            label="Afbreken"
            confirmText="Deze training afbreken? Je verliest de ingevoerde sets."
          />
        )}
      </header>

      <p className="mt-4 text-sm text-neutral-400">
        Onderdeel {index + 1} / {groups.length}
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full bg-neutral-300 transition-all"
          style={{ width: `${((index + 1) / groups.length) * 100}%` }}
        />
      </div>

      {isSuperset && (
        <p className="mt-4 flex items-center gap-2 rounded-md border border-emerald-900/50 bg-emerald-950/20 px-3 py-2 text-sm font-medium text-emerald-400">
          ⛓ Superset — doe deze {currentGroup.length} oefeningen om en om
        </p>
      )}

      <div className="mt-5 flex flex-col gap-4">
        {currentGroup.map((ex) => {
          const weId = ex.workoutExerciseId;
          const exRows = rowsByExercise[weId];
          return (
            <div key={weId} className="flex flex-col gap-4">
              <ExerciseStep
                exercise={ex.exercise}
                targets={ex.targets}
                previousSets={ex.previousSets}
                pr={ex.pr}
                rows={exRows}
                onAddSet={() => addSet(weId)}
                onRemoveSet={(i) => removeSet(weId, i)}
                onCellChange={(i, key, value) => changeCell(weId, i, key, value)}
                onToggleWarmup={(i) => toggleWarmup(weId, i)}
                onCopyPrevious={() => copyPrevious(weId, ex.previousSets)}
                onSave={() => save(weId)}
                saving={saving}
                dirty={JSON.stringify(exRows) !== snapshot[weId]}
                saved={hasData(exRows)}
                error={saveError?.id === weId ? saveError.message : null}
              />
              <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
                <NoteEditor
                  id={`note-${weId}`}
                  value={notesByExercise[weId]}
                  onChange={(value) => changeNote(weId, value)}
                  onSave={() => saveNote(weId)}
                  pending={savingNote}
                  dirty={notesByExercise[weId].trim() !== savedNotes[weId].trim()}
                  error={noteError?.id === weId ? noteError.message : null}
                />
              </section>
            </div>
          );
        })}
      </div>

      <footer className="fixed inset-x-0 bottom-0 border-t border-neutral-800 bg-neutral-950/95 px-4 py-3 backdrop-blur">
        {!isEdit && (
          <div className="mx-auto mb-2 flex max-w-2xl items-center justify-center overflow-x-auto">
            <RestTimer suggestedSeconds={suggestedRest} />
          </div>
        )}
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
              {isEdit
                ? finishing
                  ? "Opslaan…"
                  : "Wijzigingen opslaan"
                : finishing
                  ? "Afronden…"
                  : "Training afronden"}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={saving && !isEdit}
              className="flex-1 rounded-lg bg-neutral-100 px-4 py-3 text-base font-semibold text-neutral-900 transition hover:bg-white disabled:cursor-not-allowed disabled:bg-neutral-400"
            >
              {saving && !isEdit ? "Opslaan…" : "Volgende →"}
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
