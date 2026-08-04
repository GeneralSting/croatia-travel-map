import Link from "next/link";

interface AuthFooterProps {
  prompt: string;
  linkText: string;
  href: string;
}

// bottom of an auth card: labelled divider plus the cross-link to the sibling form
export function AuthFooter({ prompt, linkText, href }: AuthFooterProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-white/40">{prompt}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <Link
        href={href}
        className="mt-4 block text-center text-sm font-medium text-blue-400 transition-colors hover:text-blue-300"
      >
        {linkText}
      </Link>
    </div>
  );
}
