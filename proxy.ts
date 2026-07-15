// Next 16 renamed `middleware` → `proxy`. This runs before rendering and keeps the
// Supabase auth session fresh by rewriting the auth cookie on each request.
// It is a no-op until Supabase env vars are set, so the app runs fine before setup.

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so an expired access token is refreshed and re-set as a cookie.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on pages, but skip static assets, images, and our public data files.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|geojson|webmanifest)$).*)",
  ],
};
