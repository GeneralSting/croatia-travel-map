import { AuthCard, AuthFooter, ForgotPasswordForm } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
      footer={
        <AuthFooter
          prompt="Remembered it?"
          linkText="Back to sign in"
          href={AUTH_PATHS.LOGIN}
        />
      }
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
