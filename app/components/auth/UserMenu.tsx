"use client";

import Link from "next/link";
import { LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "./AuthProvider";

// Sits in the top bar. Hidden entirely until Supabase is configured, so the header
// is unchanged before setup.
export default function UserMenu() {
  const { user, loading, configured, signOut } = useAuth();

  if (!configured || loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/15 hover:border-white/30 transition-colors"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden sm:flex items-center gap-1.5 text-xs text-white/60 max-w-[160px] truncate">
        <UserIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="truncate">{user.email}</span>
      </span>
      <button
        onClick={signOut}
        title="Sign out"
        className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
