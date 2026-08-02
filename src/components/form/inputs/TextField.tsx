"use client";

import type { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { FieldShell } from "./FieldShell";

interface TextFieldProps {
  name: string;
  label: string;
  type?: "text" | "email" | "url";
  placeholder?: string;
  icon?: ReactNode;
  autoComplete?: string;
}

export function TextField({
  name,
  label,
  type = "text",
  placeholder,
  icon,
  autoComplete,
}: TextFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldShell name={name} label={label} icon={icon} error={error}>
      <input
        id={name}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder ?? " "}
        {...register(name)}
        className={`cx-field peer h-12 w-full rounded-xl border bg-slate-900 pr-3.5 text-sm text-white outline-none transition-colors placeholder:text-transparent focus:placeholder:text-white/30 ${
          icon ? "pl-9" : "pl-3.5"
        } ${
          error
            ? "border-red-500 focus:border-red-500"
            : "border-white/15 focus:border-blue-500"
        }`}
      />
    </FieldShell>
  );
}
