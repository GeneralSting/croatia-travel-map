"use client";

import { useFormContext } from "react-hook-form";

// Renders a single field's validation message on its own — used when the message needs to live
// somewhere other than directly under the input (e.g. sharing a row with a "Forgot password?"
// link). Pair with the field's `hideError` prop so the message isn't rendered twice.
export function FieldError({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const {
    formState: { errors },
  } = useFormContext();
  const message = errors[name]?.message as string | undefined;
  if (!message) return null;

  return <span className={`text-xs text-red-400 ${className ?? ""}`}>{message}</span>;
}
