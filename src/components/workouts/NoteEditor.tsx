"use client";

import { Button } from "@/components/ui/Button";
import { FormError } from "@/components/ui/FormError";

/** Presentatie van de notitie-editor; state wordt door de ouder beheerd. */
export function NoteEditor({
  id,
  value,
  onChange,
  onSave,
  pending,
  dirty,
  error,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  pending: boolean;
  dirty: boolean;
  error: string | null;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-neutral-300">
        Notitie
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        placeholder="Bijv. grip, tempo, instelling van het apparaat…"
        className="resize-y rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-neutral-400"
      />
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onSave}
          disabled={pending || !dirty}
        >
          {pending ? "Opslaan…" : "Notitie opslaan"}
        </Button>
        {!dirty && value.trim() !== "" && (
          <span className="text-sm text-emerald-400">Opgeslagen ✓</span>
        )}
      </div>
      <FormError message={error} />
    </div>
  );
}
