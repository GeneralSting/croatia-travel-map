# Supabase setup (Phase 1 — auth + progress)

One-time setup so the app can store per-user progress. ~5–10 minutes.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → **New project** (free tier).
2. Pick a name + a strong database password, choose the region closest to you.

## 2. Add the API keys to the app

In the Supabase dashboard: **Project Settings → API**. Copy into `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon / public key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart `npm run dev` after editing `.env.local`.

## 3. Create the tables

**SQL Editor → New query** → paste all of [`schema.sql`](./schema.sql) → **Run**.
Creates `profiles`, `poi_progress`, `county_overrides` with Row-Level Security
(each user can only read/write their own rows).

## 4. Enable email/password sign-in

**Authentication → Providers → Email**: make sure it's enabled (it is by default).
For local testing you can turn **"Confirm email" off** so signups log in immediately;
turn it back on for production.

## 5. Enable Google sign-in

1. In **Google Cloud Console** → APIs & Services → Credentials → **Create OAuth client ID**
   (type: *Web application*).
2. Under **Authorized redirect URIs**, add the callback Supabase shows you on
   **Authentication → Providers → Google** (looks like
   `https://<your-ref>.supabase.co/auth/v1/callback`).
3. Copy the Google **Client ID** + **Client secret** back into Supabase's Google provider and save.

## 6. Set the app's redirect URLs

**Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000` (change to your domain in production).
- **Redirect URLs:** add `http://localhost:3000/**` (and later your production domain).

---

That's it — the app reads `NEXT_PUBLIC_SUPABASE_*` and everything else is already wired.
Until these are set, the app runs normally but sign-in is disabled.
