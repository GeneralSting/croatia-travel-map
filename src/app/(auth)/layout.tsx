import Image from "next/image";

export default function AuthGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-start px-4 pt-16 pb-12 sm:pt-24"
      style={{
        background:
          "radial-gradient(circle at 50% 42%, #0d2136 0%, #06111f 68%)",
      }}
    >
      {/* Fixed header logo block */}
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

      {/* Dynamic content card wrapper */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl transition-[height] duration-300 sm:p-8">
        {children}
      </div>
    </div>
  );
}
