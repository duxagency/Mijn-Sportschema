import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: boolean;
};

export function Input({ label, id, name, error = false, ...props }: InputProps) {
  const fieldId = id ?? name;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={fieldId} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <input
        id={fieldId}
        name={name}
        className={`rounded-md border bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 ${
          error
            ? "border-red-500 focus:border-red-400"
            : "border-neutral-700 focus:border-neutral-400"
        }`}
        {...props}
      />
    </div>
  );
}
