// Public API of the auth-portal feature.

export { AuthProvider } from "@/features/auth-portal/components/AuthProvider";
export { useAuth } from "@/features/auth-portal/hooks/useAuth";

// NOTE: GuestGuard is intentionally NOT re-exported here. It's a server component that imports
// next/headers; this barrel is also consumed by client code (AuthProvider), so re-exporting it
// would pull server-only modules into the client bundle. Import it from its own path in pages.

// Shared static shell.
export { AuthCard } from "@/features/auth-portal/components/AuthCard";
export { AuthFooter } from "@/features/auth-portal/components/AuthFooter";
export {
  FieldSkeleton,
  ButtonSkeleton,
  DividerSkeleton,
  FooterSkeleton,
} from "@/features/auth-portal/components/Skeletons";

// One small form per page.
export { SignInForm } from "@/features/auth-portal/components/SignInForm";
export { RegisterForm } from "@/features/auth-portal/components/RegisterForm";
export { ForgotPasswordForm } from "@/features/auth-portal/components/ForgotPasswordForm";
export { ResetPasswordForm } from "@/features/auth-portal/components/ResetPasswordForm";
