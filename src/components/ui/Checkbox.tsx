import type { InputHTMLAttributes } from "react";

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function Checkbox({ label, id, name, ...props }: CheckboxProps) {
  const fieldId = id ?? name;
  return (
    <label
      htmlFor={fieldId}
      className="flex cursor-pointer items-center gap-2.5 rounded-md border border-neutral-800 px-3 py-2 text-sm text-neutral-200 transition hover:border-neutral-600 has-[:checked]:border-neutral-400 has-[:checked]:bg-neutral-900"
    >
      <input
        id={fieldId}
        name={name}
        type="checkbox"
        className="h-4 w-4 accent-neutral-100"
        {...props}
      />
      {label}
    </label>
  );
}
