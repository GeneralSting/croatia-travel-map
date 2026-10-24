"use client";

import { createContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface AuthState {
  user: User | null;
  loading: boolean;
  configured: boolean; // whether Supabase env is set up at all (gates auth UI)
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  configured: false,
  signOut: async () => {},
});

/**
 * shares the current auth user across the map via one Supabase subscription
 * safe before Supabase is configured: it simply reports "logged out"
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  const signOut = async () => {
    if (!isSupabaseConfigured) return;
    await createClient().auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    /**
     * Phase A: fetch current user
     * when the page loads the Supbase immadiately looks for the active session saved in the browser cookies
     */
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    /**
     * Phase B: subscribe to the auth changes in real-time
     * event listener that triggers automatically whenever user logs in, logs out, has their access token refreshed in the background
     */
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // clean subscription on unmount
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, configured: isSupabaseConfigured, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}
