import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 py-10">
      <header className="flex items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="size-10 rounded-lg" />
      </header>

      <Skeleton className="mt-6 h-56 rounded-xl" />

      <div className="mt-8 flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        {Array.from({ length: 3 }, (_, i) => (
          <Skeleton key={i} className="h-14 rounded-lg" />
        ))}
      </div>
    </main>
  );
}
