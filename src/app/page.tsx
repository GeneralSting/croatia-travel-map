import { redirect } from "next/navigation";
import { MapApp } from "@/features/map-explorer";
import { AUTH_PATHS } from "@/lib/data";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Safety net - if a misconfigured Supabase email/OAuth redirect drop the auth 'code' on the
 * root instead of '/auth/callback', forward it there so the session still gets exchanged
 */
export default async function Home({ searchParams }: HomeProps) {
  const { code, next } = await searchParams;
  if (typeof code === "string") {
    const urlSearchParams = new URLSearchParams({ code });
    if (typeof next === "string") urlSearchParams.set("next", next);
    redirect(`${AUTH_PATHS.CALLBACK}?${urlSearchParams}`);
  }

  return <MapApp />;
}
