"use client";

import { useFormContext } from "react-hook-form";
import { Loader2 } from "lucide-react";

// Submit button that disables + shows a spinner while the form is submitting (reads
// react-hook-form's isSubmitting from context).
export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={`flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-500 disabled:opacity-60 ${
        className ?? ""
      }`}
    >
      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
