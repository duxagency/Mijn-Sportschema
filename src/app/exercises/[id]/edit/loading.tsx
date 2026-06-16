import { Skeleton } from "@/components/ui/Skeleton";

export default function EditExerciseLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-1 mb-6 h-8 w-48" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-32 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>
    </main>
  );
}
