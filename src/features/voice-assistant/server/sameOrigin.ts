/**
 * True when a request was sent by a page on our own origin. Mirrors the check Next.js applies to
 * Server Actions: the Origin header must match the Host (or X-Forwarded-Host behind a proxy)
 *
 * What it protects against: another website making a visitor's browser call our route (CSRF-style),
 * since browsers always attach Origin to a cross-site POST and pages can't forge it. What it does
 * NOT stop: scripts outside a browser can send any headers - that's what auth + rate limiting are for
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false; // browsers send Origin on every POST fetch; a missing one isn't our page

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false; // malformed Origin, e.g. "null" from a sandboxed iframe
  }
}
