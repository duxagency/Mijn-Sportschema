export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
    >
      {message}
    </p>
  );
}
