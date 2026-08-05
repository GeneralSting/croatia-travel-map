import {
  AuthCard,
  ButtonSkeleton,
  DividerSkeleton,
  FieldSkeleton,
  FooterSkeleton,
} from "@/features/auth-portal";

// Mirrors SignInForm: Google + "Create an account" buttons, an "or" divider, email, a password
// field with the forgot-password row under it, then submit.
export default function LoginLoading() {
  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your Croatia Explorer account"
      footer={<FooterSkeleton />}
    >
      <div className="space-y-5" aria-hidden>
        <ButtonSkeleton />
        <ButtonSkeleton />
        <DividerSkeleton />
        <div className="space-y-4">
          <FieldSkeleton />
          <div>
            <FieldSkeleton />
            <div className="mt-1.5 flex min-h-5 justify-end">
              <div className="h-3 w-24 animate-pulse rounded bg-white/10" />
            </div>
          </div>
          <ButtonSkeleton />
        </div>
      </div>
    </AuthCard>
  );
}
