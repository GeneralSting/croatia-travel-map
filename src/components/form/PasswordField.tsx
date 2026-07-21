"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { FieldShell } from "./FieldShell";

interface PasswordFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  icon?: ReactNode;
  autoComplete?: string;
  // Suppress the inline message (still colours the field) when the error is shown elsewhere.
  hideError?: boolean;
}

export function PasswordField({
  name,
  label,
  placeholder,
  icon,
  autoComplete,
  hideError,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldShell
      name={name}
      label={label}
      icon={icon}
      error={error}
      hideError={hideError}
    >
      <input
        id={name}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder ?? " "}
        {...register(name)}
        className={`cx-field peer w-full rounded-lg border bg-slate-900 py-3 pr-10 text-sm text-white outline-none transition-colors placeholder:text-transparent focus:placeholder:text-white/30 ${
          icon ? "pl-9" : "pl-3.5"
        } ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-white/15 focus:border-blue-500"
        }`}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShow((s) => !s)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </FieldShell>
  );
}
