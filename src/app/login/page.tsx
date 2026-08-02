import { Suspense } from "react";
import {
  AuthLayout,
  AuthFooter,
  AuthFormSkeleton,
  SignInForm,
} from "@/features/auth-portal";

/**
 * Interactive form is Suspense-wrapped (it reads the useSearchParams), so it shows a filed skeleton
 * instead of a blank screen while it hydrated
 */
export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your Croatia Explorer account"
      footer={
        <>
          <AuthFooter
            prompt="Just exploring?"
            linkText="Continue to the map"
            href="/"
          />
        </>
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
