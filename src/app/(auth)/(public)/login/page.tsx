import { AuthCard, AuthFooter, SignInForm } from "@/features/auth-portal";
import { APP_PATHS } from "@/lib/data";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Croatia Explorer account"
      footer={
        <AuthFooter
          prompt="Just exploring?"
          linkText="Continue to the map"
          href={APP_PATHS.HOME}
        />
      }
    >
      <SignInForm />
    </AuthCard>
  );
}
