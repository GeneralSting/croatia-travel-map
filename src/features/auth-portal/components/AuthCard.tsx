import type { ReactNode } from "react";

interface AuthCardProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <>
      <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      <p className="mt-1 text-sm text-white/50">{description}</p>

      <div className="mt-6">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-white/5 pt-4">{footer}</div>
      )}
    </>
  );
}
