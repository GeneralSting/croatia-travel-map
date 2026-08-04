import { AuthCard, AuthFooter, ResetPasswordForm } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your account"
      footer={
        <AuthFooter
          prompt="Changed your mind?"
          linkText="Back to sign in"
          href={AUTH_PATHS.LOGIN}
        />
      }
    >
      <ResetPasswordForm />
    </AuthCard>
  );
}
