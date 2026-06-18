import { Skeleton } from "@/components/ui/Skeleton";

export default function RecordsLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-1 h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-64" />
      </header>

      <ul className="mt-6 flex flex-col gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </ul>
    </main>
  );
}
