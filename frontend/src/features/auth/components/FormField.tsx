import type { InputHTMLAttributes } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  registration: UseFormRegisterReturn;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">;

export function FormField({
  id,
  label,
  error,
  registration,
  ...inputProps
}: FormFieldProps) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-ink"
      >
        {label}
      </label>
      <input
        {...inputProps}
        {...registration}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="min-h-12 w-full rounded-xl border border-emerald-950/15 bg-white px-4 py-3 text-base text-ink outline-none transition placeholder:text-slate-400 focus:border-pinglix-500 focus:ring-4 focus:ring-pinglix-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-100"
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
