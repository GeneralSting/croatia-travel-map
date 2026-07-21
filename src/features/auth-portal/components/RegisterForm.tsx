"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import {
  Form,
  TextField,
  PasswordField,
  SubmitButton,
  FormError,
} from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  registerSchema,
  type RegisterValues,
} from "@/features/auth-portal/schemas";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { AuthNotice } from "./AuthNotice";
import { NotConfiguredNotice } from "./NotConfiguredNotice";

export function RegisterForm() {
  const router = useRouter();
  const [confirmSent, setConfirmSent] = useState(false);

  const onSubmit = async (values: RegisterValues) => {
    const redirectBase = window.location.origin;
    const { data, error } = await createClient().auth.signUp({
      email: values.email,
      password: values.password,
      options: { emailRedirectTo: `${redirectBase}/auth/callback` },
    });
    if (error) throw new Error(error.message);
    if (data.session) {
      router.push("/");
      router.refresh();
    } else {
      // Email confirmation required — no session yet.
      setConfirmSent(true);
    }
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;
  if (confirmSent)
    return (
      <AuthNotice>
        Check your email to confirm your account, then sign in.
      </AuthNotice>
    );

  return (
    <div className="space-y-5">
      <GoogleButton />
      <OrDivider />
      <Form schema={registerSchema} onSubmit={onSubmit} className="space-y-4">
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />
        <PasswordField
          name="password"
          label="Password"
          icon={<Lock className="h-4 w-4" />}
          autoComplete="new-password"
        />
        <FormError />
        <SubmitButton>Create account</SubmitButton>
      </Form>
    </div>
  );
}
