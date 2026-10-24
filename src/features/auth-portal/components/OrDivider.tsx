// Small "or" divider between the OAuth button and the email/password fields
export function OrDivider() {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      <span className="text-[10px] uppercase tracking-widest text-white/30">
        or
      </span>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}
