import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}
/**
 * Static, branded shell shared by every auth page
 * No client code, so pages can server-render this instantly and only Suspense-wrap the interactive form
 */
export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-start px-4 pt-16 pb-12 sm:pt-24"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
      }}
    >
      {/* 1. fixed header logo block: completely anchored regardless of card content height */}
      <div className="mb-8 flex flex-col items-center gap-3 shrink-0">
        <div className="h-22 w-22 relative">
          <Image
            src="/web-app-manifest-512x512.png"
            alt="Croatia Explorer"
            width={88}
            height={88}
            priority
            className="rounded-3xl shadow-lg"
          />
        </div>
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60 select-none">
          Croatia Explorer
        </span>
      </div>

      {/* 2. dynamic content card: the container shifts downwards contextually, leaving the top fixed */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl transition-[height] duration-300 sm:p-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {title}
        </h1>
        <p className="mt-1 text-sm text-white/50">{description}</p>

        <div className="mt-6">{children}</div>

        {footer && (
          <div className="mt-6 border-t border-white/5 pt-4">{footer}</div>
        )}
      </div>
    </div>
  );
}
