import "server-only";

import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

/**
 * Server guard for the public (signed-out only) auth pages (login, register, forgot-password)
 * A logged-in user has no reason to see these, so we send them to the map before anything renders — no form flash
 */
export async function PublicAuthGuard({ children }: { children: ReactNode }) {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect("/");
  }

  return <>{children}</>;
}
