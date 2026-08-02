"use client";

import { useFormContext } from "react-hook-form";

/**
 * Renders the form-level error set when a submit handler throws. Field-level errors are
 * rendered inline by the fields themselves
 */
export function FormError() {
  const {
    formState: { errors },
  } = useFormContext();
  const message = errors.root?.message;
  if (!message) return null;

  return (
    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
      {String(message)}
    </p>
  );
}
