import { Skeleton } from "@/components/ui/Skeleton";

export default function ProgressLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-1 h-7 w-40" />
        <Skeleton className="mt-2 h-4 w-56" />
      </header>

      <div className="mt-6 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full" />
        ))}
      </div>

      <Skeleton className="mt-6 h-56 rounded-xl" />
    </main>
  );
}
