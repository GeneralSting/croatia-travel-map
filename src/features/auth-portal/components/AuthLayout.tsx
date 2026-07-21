// Static, branded shell shared by every auth page: the app mark + wordmark over a card that
// holds the title, description, the form (passed as children), and an optional footer. No client
// code, so pages can server-render this instantly and only Suspense-wrap the interactive form.

import Image from "next/image";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4 py-10"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
      }}
    >
      <div className="mb-6 flex flex-col items-center gap-3">
        <Image
          src="/web-app-manifest-512x512.png"
          alt="Croatia Explorer"
          width={88}
          height={88}
          priority
          className="rounded-3xl shadow-lg"
        />
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-white/60">
          Croatia Explorer
        </span>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl sm:p-8">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-white/50">{description}</p>
        <div className="mt-6">{children}</div>
        {footer}
      </div>
    </div>
  );
}
