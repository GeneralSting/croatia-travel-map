"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Loader2 } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Mode = "signin" | "signup" | "forgot" | "update";

const TITLES: Record<Mode, string> = {
  signin: "Sign in",
  signup: "Create your account",
  forgot: "Reset your password",
  update: "Set a new password",
};

/**
 * unified authentication portal
 * uses single state (mode) to cycle through four separate user actions
 */
export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const initialMode = (params.get("mode") as Mode) || "signin";

  const [mode, setMode] = useState<Mode>(
    ["signin", "signup", "forgot", "update"].includes(initialMode)
      ? initialMode
      : "signin",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    params.get("error") ? "Authentication failed. Please try again." : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const redirectBase =
    typeof window !== "undefined" ? window.location.origin : "";

  if (!isSupabaseConfigured) {
    return (
      <Shell>
        <p className="text-sm text-white/60 text-center">
          Sign-in isn&apos;t configured yet. Add your Supabase keys to{" "}
          <code className="text-white/80">.env.local</code> (see{" "}
          <code className="text-white/80">supabase/README.md</code>) and
          restart.
        </p>
        <Link
          href="/"
          className="mt-4 block text-center text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to the map
        </Link>
      </Shell>
    );
  }

  const supabase = createClient();

  const handleGoogle = async () => {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${redirectBase}/auth/callback` },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/");
        router.refresh();
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${redirectBase}/auth/callback` },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/");
          router.refresh();
        } else {
          setNotice("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else if (mode === "forgot") {
        const next = encodeURIComponent("/login?mode=update");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${redirectBase}/auth/callback?next=${next}`,
        });
        if (error) throw error;
        setNotice("Password reset link sent — check your email.");
      } else if (mode === "update") {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  };

  const showPassword = mode !== "forgot";
  const showEmail = mode !== "update";

  return (
    <Shell>
      <h1 className="text-xl font-bold text-white text-center mb-1">
        {TITLES[mode]}
      </h1>
      <p className="text-xs text-white/40 text-center mb-6">
        Track where you&apos;ve been across Croatia.
      </p>

      {mode !== "update" && (
        <>
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-medium hover:bg-white/90 transition-colors"
          >
            <GoogleGlyph />
            Continue with Google
          </button>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] text-white/30 uppercase tracking-widest">
              or
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {showEmail && (
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
          />
        )}
        {showPassword && (
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "update" ? "New password" : "Password"}
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-blue-500"
          />
        )}

        {error && <p className="text-xs text-red-400">{error}</p>}
        {notice && <p className="text-xs text-green-400">{notice}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 text-white text-sm font-medium transition-colors"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {mode === "signin" && "Sign in"}
          {mode === "signup" && "Create account"}
          {mode === "forgot" && "Send reset link"}
          {mode === "update" && "Update password"}
        </button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 text-xs text-white/40">
        {mode === "signin" && (
          <>
            <button
              onClick={() => setMode("forgot")}
              className="hover:text-white/70"
            >
              Forgot your password?
            </button>
            <span>
              New here?{" "}
              <button
                onClick={() => setMode("signup")}
                className="text-blue-400 hover:text-blue-300"
              >
                Create an account
              </button>
            </span>
          </>
        )}
        {mode === "signup" && (
          <span>
            Already have an account?{" "}
            <button
              onClick={() => setMode("signin")}
              className="text-blue-400 hover:text-blue-300"
            >
              Sign in
            </button>
          </span>
        )}
        {(mode === "forgot" || mode === "update") && (
          <button
            onClick={() => setMode("signin")}
            className="hover:text-white/70"
          >
            ← Back to sign in
          </button>
        )}
      </div>

      <Link
        href="/"
        className="mt-6 block text-center text-xs text-white/30 hover:text-white/60"
      >
        ← Back to the map
      </Link>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-white">Croatia Explorer</span>
        </div>
        <div className="bg-slate-900/80 backdrop-blur border border-white/10 rounded-2xl p-6 shadow-2xl">
          {children}
        </div>
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
    </svg>
  );
}
