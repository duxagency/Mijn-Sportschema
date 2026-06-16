import { Skeleton } from "@/components/ui/Skeleton";

export default function WorkoutDetailLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-start justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-9 w-36" />
      </header>

      <Skeleton className="mt-6 h-12 rounded-lg" />
      <Skeleton className="mt-6 h-24 rounded-xl" />

      <ul className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </ul>
    </main>
  );
}
