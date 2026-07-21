import { Suspense } from "react";
import {
  AuthLayout,
  AuthFooter,
  AuthFormSkeleton,
  ResetPasswordForm,
} from "@/features/auth-portal";

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      title="Set a new password"
      description="Choose a new password for your account"
      footer={
        <AuthFooter
          prompt="Changed your mind?"
          linkText="Back to sign in"
          href="/login"
        />
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
