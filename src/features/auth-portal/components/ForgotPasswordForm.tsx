"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import {
  FormBuilder,
  TextField,
  SubmitButton,
  FormError,
} from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth-portal/schemas";
import { AuthNotice } from "./AuthNotice";
import { NotConfiguredNotice } from "./NotConfiguredNotice";
import { AUTH_PATHS } from "@/lib/data";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = async (values: ForgotPasswordValues) => {
    const redirectBase = window.location.origin;
    const next = encodeURIComponent(AUTH_PATHS.RESET_PASSWORD);
    const redirectToUrl = `${redirectBase}${AUTH_PATHS.CALLBACK}?next=${next}`;
    const { error } = await createClient().auth.resetPasswordForEmail(
      values.email,
      { redirectTo: redirectToUrl },
    );
    if (error) throw new Error(error.message);
    setSent(true);
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;
  if (sent)
    return (
      <AuthNotice>Password reset link sent - check your email.</AuthNotice>
    );

  return (
    <FormBuilder
      schema={forgotPasswordSchema}
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <TextField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
        icon={<Mail className="h-4 w-4" />}
        autoComplete="email"
      />
      <FormError />
      <SubmitButton>Send reset link</SubmitButton>
    </FormBuilder>
  );
}
