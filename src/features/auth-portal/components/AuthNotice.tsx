// Success / info panel shown in place of a form after submit (e.g. "check your email"), with a
// link back to sign in.

import { AUTH_PATHS } from "@/lib/data";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthNotice({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
        {children}
      </div>
      <Link
        href={AUTH_PATHS.LOGIN}
        className="block text-center text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        Back to sign in
      </Link>
    </div>
  );
}
