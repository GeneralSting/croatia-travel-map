import { Suspense } from "react";
import { LoginForm } from "@/features/auth-portal";

/**
 * Suspense is needed because the login form uses the useSearchParams() - forces the component to be rendered dynamically on client side
 * not wrapping it with Suspense will cause the loss of the static optimization or prerender the rest of the page layout
 * (marking it client-side dynamic rendering at runtime)
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
