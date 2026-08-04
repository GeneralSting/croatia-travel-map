// Reusable skeleton primitives for the auth loading states. Each matches the geometry of the real element

/**
 * a field at rest is just the bordered input box - the floating label sits inside it, so there's no separate label row
 */
export function FieldSkeleton() {
  return (
    <div className="h-12 w-full animate-pulse rounded-lg border border-white/5 bg-white/5" />
  );
}

// Google / "Create an account" / Submit — all full-width h-11 buttons.
export function ButtonSkeleton() {
  return <div className="h-11 w-full animate-pulse rounded-lg bg-white/10" />;
}

// The "or" divider between the OAuth buttons and the fields.
export function DividerSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <div className="h-2 w-4 animate-pulse rounded bg-white/10" />
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

// Matches AuthFooter (labelled divider + centred link)
export function FooterSkeleton() {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <div className="mx-auto mt-4 h-3.5 w-32 animate-pulse rounded bg-white/10" />
    </div>
  );
}
