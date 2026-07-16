// it generates a Supabase client capable of synchronizing its authentication state directly with browser cookies
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"; // utility that allows server-side code to read, set and delete HTTP cookies

/**
 * server-side Supbabase client (Server Components, Route Handlers, Server Actions)
 * `cookies()` is async in Next 16
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // read all existing cookies. If it finds a valid session token, it authenticates the user
        getAll() {
          return cookieStore.getAll();
        },
        // updates the browser cookies when a user logs in, logs out, or their login token is refreshed
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /**
             * Server Components are read-only
             * if we try to save a cookie while rendering a page Next will throw a error
             * catch block safely ignores this error because Route Handlers or middleware will handle the actual
             * cookie-setting behind the scenes
             */
          }
        },
      },
    },
  );
}
