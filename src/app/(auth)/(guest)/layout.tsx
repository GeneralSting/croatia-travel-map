import type { ReactNode } from "react";
import { GuestGuard } from "@/features/auth-portal/components/GuestGuard";

// Guest guard subgroup - the guard runs once here and redirects already authenticated users to the map
export default function GuestLayout({ children }: { children: ReactNode }) {
  return <GuestGuard>{children}</GuestGuard>;
}
