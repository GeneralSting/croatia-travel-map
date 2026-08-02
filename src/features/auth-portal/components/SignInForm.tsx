"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import {
  FormBuilder,
  TextField,
  PasswordField,
  SubmitButton,
  FormError,
} from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  signInSchema,
  type SignInValues,
} from "@/features/auth-portal/schemas";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { NotConfiguredNotice } from "./NotConfiguredNotice";
import { RegisterButton } from "./RegisterButton";
import { FieldErrorWithLink } from "@/components/form/inputs/FieldErrorWithLink";

export function SignInForm() {
  const router = useRouter();
  const oauthFailed = !!useSearchParams().get("error");

  const onSubmit = async (values: SignInValues) => {
    const { error } = await createClient().auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) throw new Error(error.message);
    router.push("/");
    router.refresh();
  };

  if (!isSupabaseConfigured) return <NotConfiguredNotice />;

  return (
    <div className="space-y-5">
      <GoogleButton />
      <RegisterButton />
      <OrDivider />
      <FormBuilder
        schema={signInSchema}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        {oauthFailed && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            Google sign-in failed. Please try again.
          </p>
        )}
        <TextField
          name="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />
        {/* Group so the error/forgot row sits 6px under the input (a normal field-error gap),
            not the form's 16px stack gap. */}
        <div>
          <PasswordField
            name="password"
            label="Password"
            icon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            hideError // Tells the field to skip rendering its default bottom error text
          />

          <FieldErrorWithLink name="password">
            <Link
              href="/forgot-password"
              className="text-xs text-blue-400 transition-colors hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </FieldErrorWithLink>
        </div>
        <FormError />
        <SubmitButton>Login</SubmitButton>
      </FormBuilder>
    </div>
  );
}
