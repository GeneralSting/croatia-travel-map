"use client";

import type { ReactNode } from "react";

interface FieldShellProps {
  name: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  hideError?: boolean;
  children: ReactNode;
}

/**
 * Shared frame for the MUI-style outlined fields: an optional leading icon, the input
 * passed as children, carrying the 'peer' class, a floating label and the error line
 * The label rests inside the field and floats up onto the border on focus or once the field has a value
 * driven purely by the input's `:placeholder-shown` state (both float conditions set the same target,
 * so it's independent of Tailwind's variant order)
 */
export function FieldShell({
  name,
  label,
  icon,
  error,
  hideError,
  children,
}: FieldShellProps) {
  return (
    <div>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
            {icon}
          </span>
        )}
        {children}
        <label
          htmlFor={name}
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 bg-slate-900 px-1 text-sm transition-all duration-150 ${
            icon ? "left-9" : "left-3.5"
          } ${error ? "text-red-400" : "text-white/40"}
            peer-focus:left-3.5 peer-focus:top-0 peer-focus:text-xs ${
              error ? "peer-focus:text-red-400" : "peer-focus:text-blue-400"
            }
            peer-not-placeholder-shown:left-3.5 peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs`}
        >
          {label}
        </label>
      </div>
      {error && !hideError && (
        <p className="mt-1.5 px-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}
