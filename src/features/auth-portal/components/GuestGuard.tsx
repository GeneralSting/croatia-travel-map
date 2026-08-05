import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Server guard for guest-only pages (login, register, forgot-password). A logged-in user has no
 * reason to see these, so we send them to the map before anything renders — no form flash.
 *
 * Deliberately applied per-page, NOT to the whole (auth) group: /reset-password's recovery session
 * counts as authenticated, so wrapping the group would redirect users mid-reset and break the flow.
 */
export async function GuestGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return <>{children}</>;
}
