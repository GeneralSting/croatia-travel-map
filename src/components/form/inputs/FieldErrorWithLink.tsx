"use client";

import { useFormContext } from "react-hook-form";

interface FieldErrorWithLinkProps {
  name: string;
  children: React.ReactNode;
}

/**
 * renders a single field's validation message and link in the same row
 * on its own - used when the message needs to live somwhere other then directly under the input
 * Pair with the field's 'hideError' prop so the message isn't rendered twice
 */
export function FieldErrorWithLink({
  name,
  children,
}: FieldErrorWithLinkProps) {
  const {
    formState: { errors },
  } = useFormContext();

  const message = errors[name]?.message as string | undefined;

  return (
    <div className="mt-1.5 flex min-h-5 items-center gap-3">
      {/* If there's an error, it prints here. If not, it safely renders empty space */}
      {message ? (
        <span className="text-xs text-red-400 min-w-0 truncate">{message}</span>
      ) : (
        <div className="flex-1" />
      )}

      {/* The secondary link/action is automatically pushed to the right side */}
      <div className="ml-auto shrink-0 flex items-center">{children}</div>
    </div>
  );
}
