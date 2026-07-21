"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import {
  Form,
  TextField,
  PasswordField,
  SubmitButton,
  FormError,
  FieldError,
} from "@/components/form";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  signInSchema,
  type SignInValues,
} from "@/features/auth-portal/schemas";
import { GoogleButton } from "./GoogleButton";
import { OrDivider } from "./OrDivider";
import { NotConfiguredNotice } from "./NotConfiguredNotice";

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
      <OrDivider />
      <Form schema={signInSchema} onSubmit={onSubmit} className="space-y-4">
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
            hideError
          />
          {/* Fixed-height row: the password error sits to the left of the link, so the link
              never shifts whether or not an error is showing. */}
          <div className="mt-1.5 flex min-h-5 items-center gap-3">
            <FieldError name="password" className="min-w-0 truncate" />
            <Link
              href="/forgot-password"
              className="ml-auto shrink-0 text-xs text-blue-400 transition-colors hover:text-blue-300"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <FormError />
        <SubmitButton>Login</SubmitButton>
      </Form>
    </div>
  );
}
