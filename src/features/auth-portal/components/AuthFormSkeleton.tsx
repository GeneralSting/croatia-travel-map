// Suspense fallback for the auth form island — matches the field/button rhythm so the branded
// shell shows instantly with no layout shift while the interactive form hydrates.

export function AuthFormSkeleton({ fields = 2 }: { fields?: number }) {
  return (
    <div className="space-y-4" aria-hidden>
      <div className="h-[46px] w-full animate-pulse rounded-lg bg-white/10" />
      <div className="my-1 h-px bg-white/10" />
      {Array.from({ length: fields }).map((_, i) => (
        <div
          key={i}
          className="h-[46px] w-full animate-pulse rounded-lg bg-white/5"
        />
      ))}
      <div className="h-[46px] w-full animate-pulse rounded-lg bg-white/10" />
    </div>
  );
}
