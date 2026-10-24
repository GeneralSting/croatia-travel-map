import {
  AuthCard,
  ButtonSkeleton,
  FieldSkeleton,
  FooterSkeleton,
} from "@/features/auth-portal";

// Mirrors ResetPasswordForm: new password + confirm password + submit.
export default function ResetPasswordLoading() {
  return (
    <AuthCard
      title="Set a new password"
      description="Choose a new password for your account"
      footer={<FooterSkeleton />}
    >
      <div className="space-y-4" aria-hidden>
        <FieldSkeleton />
        <FieldSkeleton />
        <ButtonSkeleton />
      </div>
    </AuthCard>
  );
}
