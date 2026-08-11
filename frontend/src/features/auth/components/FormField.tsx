import type { InputHTMLAttributes, ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";

import { Icon, type IconName } from "../../../components/ui/Icon";

type FormFieldProps = {
  id: string;
  label: string;
  error?: string;
  icon?: IconName;
  trailing?: ReactNode;
  registration: UseFormRegisterReturn;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "name">;

export function FormField({
  id,
  label,
  error,
  icon,
  trailing,
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
      <div className="group relative">
        {icon ? (
          <Icon
            name={icon}
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500 transition group-focus-within:text-pinglix-700"
          />
        ) : null}
        <input
          {...inputProps}
          {...registration}
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`min-h-12 w-full rounded-lg border border-transparent bg-surface-low py-3 text-base text-ink outline-none transition placeholder:text-slate-400 hover:bg-surface-container focus:border-pinglix-600 focus:bg-white focus:ring-4 focus:ring-pinglix-100 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-100 ${
            icon ? "pl-12" : "pl-4"
          } ${trailing ? "pr-12" : "pr-4"}`}
        />
        {trailing ? (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {trailing}
          </div>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
