import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google) and email-confirmation links land here with a `code`, which we exchange
 * for a session cookie, then send the user on the `next` (default "/")
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code"); // grabs that temporary authorization code sent by Supabase
  const next = searchParams.get("next") ?? "/"; // determines where to send the user after they successfully log in

  if (code) {
    const supabase = await createClient();
    /**
     * takes the temporary code, contacts Supabase's servers behind the scenes
     * gets the actual user session, and automatically stores it in app's cookies
     */
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
