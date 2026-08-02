"use client";

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
import { NotConfiguredNotice } from "./NotConfiguredNotice";

export function ResetPasswordForm() {
  const router = useRouter();

  const onSubmit = async (values: ResetPasswordValues) => {
    // The recovery link already established a session via /auth/callback, so we can update the
    // password directly.
    const { error } = await createClient().auth.updateUser({
      password: values.password,
    });
    if (error) throw new Error(error.message);
    router.push("/");
    router.refresh();
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;

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
