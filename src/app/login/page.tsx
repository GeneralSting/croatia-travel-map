import { Suspense } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  AuthLayout,
  AuthFooter,
  AuthFormSkeleton,
  SignInForm,
} from "@/features/auth-portal";

// The branded shell (AuthLayout) is fully static and server-rendered; only the interactive form
// island is Suspense-wrapped (SignInForm reads useSearchParams), so it shows a field skeleton
// instead of a blank screen while it hydrates.
export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      description="Sign in to your Croatia Explorer account"
      footer={
        <>
          <AuthFooter
            prompt="New here?"
            linkText="Create an account"
            href="/register"
          />
          {/* You can browse the map read-only without an account. */}
          <Link
            href="/"
            className="mt-4 flex items-center justify-center gap-1 text-xs text-white/40 transition-colors hover:text-white/70"
          >
            Just exploring? Continue to the map
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </>
      }
    >
      <Suspense fallback={<AuthFormSkeleton fields={2} />}>
        <SignInForm />
      </Suspense>
    </AuthLayout>
  );
}
