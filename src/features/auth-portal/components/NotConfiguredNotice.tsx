import Link from "next/link";
import { APP_PATHS } from "@/lib/data";

/**
 * Shown in place of any auth form when Supabase env vars are missing, so the page degrades
 * gracefully instead of throwing on an empty client
 */
export function NotConfiguredNotice() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-white/60">
        Sign-in isn&apos;t configured yet. Add your Supabase keys to{" "}
        <code className="text-white/80">.env.local</code> and restart.
      </p>
      <Link
        href={APP_PATHS.HOME}
        className="block text-center text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to the map
      </Link>
    </div>
  );
}
