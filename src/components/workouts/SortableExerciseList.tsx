"use client";

import { useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderWorkoutExercises } from "@/lib/actions/workouts";
import { FormError } from "@/components/ui/FormError";
import {
  WorkoutExerciseCard,
  type WorkoutExerciseWithExercise,
} from "./WorkoutExerciseCard";

export function SortableExerciseList({
  exercises,
  workoutId,
}: {
  exercises: WorkoutExerciseWithExercise[];
  workoutId: string;
}) {
  const [items, setItems] = useState(exercises);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // De server kan de lijst opnieuw aanleveren (toevoegen, verwijderen,
  // combineren, revalidate); reset de lokale volgorde wanneer dat gebeurt. De
  // combineer-vlag zit in de signatuur zodat een wijziging daarvan ook
  // doorkomt. Tijdens het renderen bijwerken voorkomt cascading renders.
  const serverSignature = exercises
    .map((item) => `${item.id}:${item.combined_with_previous}`)
    .join(",");
  const [prevSignature, setPrevSignature] = useState(serverSignature);
  if (serverSignature !== prevSignature) {
    setPrevSignature(serverSignature);
    setItems(exercises);
  }

  const sensors = useSensors(
    // distance-drempel zodat een tik op de kaart (knoppen/velden) niet meteen
    // een sleep start; werkt voor zowel muis als touch via pointer events.
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previous = items;
    const next = arrayMove(items, oldIndex, newIndex);

    // Optimistisch bijwerken; bij een fout herstellen we de oude volgorde.
    setItems(next);
    setError(null);

    startTransition(async () => {
      const result = await reorderWorkoutExercises(
        workoutId,
        next.map((item) => item.id),
      );
      if (result.error) {
        setItems(previous);
        setError(result.error);
      }
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <ol className="flex flex-col gap-3">
            {items.map((workoutExercise, index) => (
              <WorkoutExerciseCard
                key={workoutExercise.id}
                workoutExercise={workoutExercise}
                workoutId={workoutId}
                index={index}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
      <FormError message={error} />
    </div>
  );
}
