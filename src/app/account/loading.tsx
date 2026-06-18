import { Skeleton } from "@/components/ui/Skeleton";

export default function AccountLoading() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-10">
      <header className="border-b border-neutral-800 pb-6">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-1 h-7 w-32" />
        <Skeleton className="mt-2 h-4 w-40" />
      </header>

      <div className="mt-6 flex flex-col gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </main>
  );
}
