import { AuthCard, AuthFooter, SignInForm } from "@/features/auth-portal";
import { APP_PATHS } from "@/lib/data";

// The route's loading.tsx is the Suspense boundary (and the SignInForm useSearchParams boundary),
// so the page just composes the card + form. The (guest) group layout handles the auth redirect.
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
