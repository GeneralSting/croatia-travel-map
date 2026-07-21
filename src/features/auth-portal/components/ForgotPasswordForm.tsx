"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Form, TextField, SubmitButton, FormError } from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth-portal/schemas";
import { AuthNotice } from "./AuthNotice";
import { NotConfiguredNotice } from "./NotConfiguredNotice";

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = async (values: ForgotPasswordValues) => {
    const redirectBase = window.location.origin;
    const next = encodeURIComponent("/reset-password");
    const { error } = await createClient().auth.resetPasswordForEmail(
      values.email,
      { redirectTo: `${redirectBase}/auth/callback?next=${next}` },
    );
    if (error) throw new Error(error.message);
    setSent(true);
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;
  if (sent)
    return (
      <AuthNotice>Password reset link sent — check your email.</AuthNotice>
    );

  return (
    <Form
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
    </Form>
  );
}
