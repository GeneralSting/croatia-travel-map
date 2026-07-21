import { Suspense } from "react";
import {
  AuthLayout,
  AuthFooter,
  AuthFormSkeleton,
  ForgotPasswordForm,
} from "@/features/auth-portal";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
      footer={
        <AuthFooter
          prompt="Remembered it?"
          linkText="Back to sign in"
          href="/login"
        />
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={1} />}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
