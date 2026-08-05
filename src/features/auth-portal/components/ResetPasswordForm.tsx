"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import {
  FormBuilder,
  PasswordField,
  SubmitButton,
  FormError,
} from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth-portal/schemas";
import { AuthNotice } from "./AuthNotice";
import { NotConfiguredNotice } from "./NotConfiguredNotice";
import { APP_PATHS, AUTH_PATHS } from "@/lib/data";
import { AuthFormSkeletonInline } from "./Skeletons";

// `checking` while we confirm a recovery session exists, `ready` once it does, `invalid` when the
// page was opened directly (no session) instead of through the emailed reset link.
type SessionState = "checking" | "ready" | "invalid";

export function ResetPasswordForm() {
  const router = useRouter();
  const [sessionState, setSessionState] = useState<SessionState>("checking");

  // A valid recovery session is only established by clicking the emailed link (which passes
  // through /auth/callback → exchangeCodeForSession). Without it, updateUser would just fail — so
  // we check up front and show guidance instead of a dead form.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSessionState(data.session ? "ready" : "invalid");
    });

    // The recovery session can also land just after mount; upgrade to `ready` if it does.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setSessionState("ready");
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async (values: ResetPasswordValues) => {
    // The recovery link already established a session via /auth/callback, so we can update the
    // password directly.
    const { error } = await createClient().auth.updateUser({
      password: values.password,
    });
    if (error) throw new Error(error.message);
    router.push(APP_PATHS.HOME);
    router.refresh();
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;
  if (sessionState === "checking") return <AuthFormSkeletonInline fields={2} />;
  if (sessionState === "invalid")
    return (
      <AuthNotice
        variant="error"
        href={AUTH_PATHS.FORGOT_PASSWORD}
        linkText="Request a new reset link"
      >
        This password reset link is invalid or has expired. Reset links can only
        be opened once, and expire after a short time — request a fresh one to
        continue.
      </AuthNotice>
    );

  return (
    <FormBuilder
      schema={resetPasswordSchema}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <PasswordField
        name="password"
        label="New password"
        icon={<Lock className="h-4 w-4" />}
        autoComplete="new-password"
      />
      <PasswordField
        name="confirmPassword"
        label="Confirm password"
        icon={<Lock className="h-4 w-4" />}
        autoComplete="new-password"
      />
      <FormError />
      <SubmitButton>Update password</SubmitButton>
    </FormBuilder>
  );
}
