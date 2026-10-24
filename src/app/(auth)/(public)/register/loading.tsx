import {
  AuthCard,
  ButtonSkeleton,
  DividerSkeleton,
  FieldSkeleton,
  FooterSkeleton,
} from "@/features/auth-portal";

// Mirrors RegisterForm: Google button, "or" divider, email, password, submit.
export default function RegisterLoading() {
  return (
    <AuthCard
      title="Create your account"
      description="Start tracking where you've been across Croatia"
      footer={<FooterSkeleton />}
    >
      <div className="space-y-5" aria-hidden>
        <ButtonSkeleton />
        <DividerSkeleton />
        <div className="space-y-4">
          <FieldSkeleton />
          <FieldSkeleton />
          <ButtonSkeleton />
        </div>
      </div>
    </AuthCard>
  );
}
