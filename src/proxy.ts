/**
 * Supabase auth session fresh by rewriting the auth cookie on each request
 * It is not a no-operation until Supabase env vars are set, so the app runs fine before setup
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  // here not using getEnvVariable utility because it is not suited for the middleware
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 1. Update the request cookies so the current route handler knows who the user is
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        // 2. Re-initialize a blank clone response containing the modified request cookies
        response = NextResponse.next({ request });
        // 3. Write those updated tokens onto the response headers so the browser saves them permanently
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Touch the session so an expired access token is refreshed and re-set as a cookie
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Run on pages, but skip static assets, images, and our public data files.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:png|jpg|jpeg|svg|webp|ico|geojson|webmanifest)$).*)",
  ],
};
