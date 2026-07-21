import { Suspense } from "react";
import {
  AuthLayout,
  AuthFooter,
  AuthFormSkeleton,
  RegisterForm,
} from "@/features/auth-portal";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create your account"
      description="Start tracking where you've been across Croatia"
      footer={
        <AuthFooter
          prompt="Already a member?"
          linkText="Sign in"
          href="/login"
        />
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <RegisterForm />
      </Suspense>
    </AuthLayout>
  );
}
