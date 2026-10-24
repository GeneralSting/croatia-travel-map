import {
  AuthCard,
  ButtonSkeleton,
  FieldSkeleton,
  FooterSkeleton,
} from "@/features/auth-portal";

// Mirrors ForgotPasswordForm: email + submit.
export default function ForgotPasswordLoading() {
  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we'll send you a reset link"
      footer={<FooterSkeleton />}
    >
      <div className="space-y-4" aria-hidden>
        <FieldSkeleton />
        <ButtonSkeleton />
      </div>
    </AuthCard>
  );
}
