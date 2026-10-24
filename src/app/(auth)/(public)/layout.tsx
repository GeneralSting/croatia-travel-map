import type { ReactNode } from "react";
import { PublicAuthGuard } from "@/features/auth-portal/index.server";

// Public (signed-out only) subgroup — the guard runs once here and redirects authenticated users to the map.
export default function PublicAuthLayout({ children }: { children: ReactNode }) {
  return <PublicAuthGuard>{children}</PublicAuthGuard>;
}
