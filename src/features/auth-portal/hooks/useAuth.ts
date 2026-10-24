"use client";

import { useContext } from "react";
import { AuthContext } from "@/features/auth-portal/components/AuthProvider";

// Read the current auth state (user, loading, configured, signOut)
export const useAuth = () => {
  const context = useContext(AuthContext);

  // if the context is undefined, it means this hook is being used outside the Provider
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
