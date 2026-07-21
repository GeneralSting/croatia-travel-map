// Public API of the auth-portal feature.

export { AuthProvider } from "@/features/auth-portal/components/AuthProvider";
export { useAuth } from "@/features/auth-portal/hooks/useAuth";

// Shared static shell.
export { AuthLayout } from "@/features/auth-portal/components/AuthLayout";
export { AuthFooter } from "@/features/auth-portal/components/AuthFooter";
export { AuthFormSkeleton } from "@/features/auth-portal/components/AuthFormSkeleton";

// One small form per page.
export { SignInForm } from "@/features/auth-portal/components/SignInForm";
export { RegisterForm } from "@/features/auth-portal/components/RegisterForm";
export { ForgotPasswordForm } from "@/features/auth-portal/components/ForgotPasswordForm";
export { ResetPasswordForm } from "@/features/auth-portal/components/ResetPasswordForm";
