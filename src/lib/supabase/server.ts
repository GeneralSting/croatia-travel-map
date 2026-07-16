// it generates a Supabase client capable of synchronizing its authentication state directly with browser cookies
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers"; // utility that allows server-side code to read, set and delete HTTP cookies
import { getEnvVariable } from "../getEnvVariable";

/**
 * server-side Supbabase client (Server Components, Route Handlers, Server Actions)
 * `cookies()` is async in Next 16
 */
export async function createClient() {
  const cookieStore = await cookies();

  const supabaseUrl = getEnvVariable("NEXT_PUBLIC_SUPABASE_URL");
  const supabaseAnonKey = getEnvVariable("NEXT_PUBLIC_SUPABASE_ANON_KEY");

  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
  });
}
