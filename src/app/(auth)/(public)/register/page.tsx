import { AuthCard, AuthFooter, RegisterForm } from "@/features/auth-portal";
import { AUTH_PATHS } from "@/lib/data";

export default function RegisterPage() {
  return (
    <AuthCard
      title="Create your account"
      description="Start tracking where you've been across Croatia"
      footer={
        <AuthFooter
          prompt="Already a member?"
          linkText="Sign in"
          href={AUTH_PATHS.LOGIN}
        />
      }
    >
      <RegisterForm />
    </AuthCard>
  );
}
