// Info panel shown in place of a form (e.g. "check your email", or an invalid/expired reset
// link), with a link back to sign in — or wherever `href`/`linkText` point.

import { AUTH_PATHS } from "@/lib/data";
import Link from "next/link";
import type { ReactNode } from "react";

const VARIANTS = {
  success: "border-green-500/30 bg-green-500/10 text-green-300",
  error: "border-red-500/30 bg-red-500/10 text-red-300",
} as const;

export function AuthNotice({
  children,
  variant = "success",
  href = AUTH_PATHS.LOGIN,
  linkText = "Back to sign in",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  href?: string;
  linkText?: string;
}) {
  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border px-4 py-3 text-sm ${VARIANTS[variant]}`}
      >
        {children}
      </div>
      <Link
        href={href}
        className="block text-center text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        {linkText}
      </Link>
    </div>
  );
}
