// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";

/**
 * Route-handler test: we call the exported POST() directly with a Web Request, the same object Next
 * passes in. Runs in the node environment (a server route has no DOM)
 *
 * Boundaries are replaced, the logic in between is real:
 *  - ElevenLabs -> MSW intercepts the real fetch, so the request we send (URL, headers) is asserted
 *  - Supabase auth -> mocked createClient(); getUser() returns whoever the test wants signed in
 *  - `server-only` -> mocked; the real package throws outside Next's server build on purpose
 */

vi.mock("server-only", () => ({}));

const auth = vi.hoisted(() => ({ user: null as { id: string } | null }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: auth.user } }) },
  }),
}));

const TOKEN_URL = "https://api.elevenlabs.io/v1/convai/conversation/token";
const ORIGIN = "http://localhost:3000";

function tokenRequest(origin: string | null = ORIGIN) {
  const headers: Record<string, string> = { host: "localhost:3000" };
  if (origin) headers.origin = origin;
  return new Request(`${ORIGIN}/api/voice/token`, { method: "POST", headers });
}

/**
 * The route keeps its rate limiter in module scope, so each test imports a fresh copy of the module -
 * otherwise one test's requests would count against the next
 */
async function loadRoute() {
  vi.resetModules();
  return import("./route");
}

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_VOICE_ENABLED", "true");
  vi.stubEnv("ELEVENLABS_API_KEY", "test-eleven-key");
  vi.stubEnv("ELEVENLABS_AGENT_ID", "agent_test");
  auth.user = { id: "user-1" };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("POST /api/voice/token", () => {
  it("returns a conversation token, sending our key and agent id to ElevenLabs", async () => {
    let sent: { agentId: string | null; apiKey: string | null } | null = null;
    server.use(
      http.get(TOKEN_URL, ({ request }) => {
        sent = {
          agentId: new URL(request.url).searchParams.get("agent_id"),
          apiKey: request.headers.get("xi-api-key"),
        };
        return HttpResponse.json({ token: "tok_123", conversation_id: "conv_1" });
      }),
    );
    const { POST } = await loadRoute();

    const response = await POST(tokenRequest());

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ token: "tok_123" }); // conversation_id isn't passed on
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(sent).toEqual({ agentId: "agent_test", apiKey: "test-eleven-key" });
  });

  it("answers 503 when the feature flag is off (and never calls ElevenLabs)", async () => {
    vi.stubEnv("NEXT_PUBLIC_VOICE_ENABLED", "false");
    const { POST } = await loadRoute();

    // No MSW handler registered: an outgoing request would fail the test (onUnhandledRequest: "error")
    const response = await POST(tokenRequest());

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({ error: "voice_unavailable" });
  });

  it("answers 503 when the API key is missing", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const { POST } = await loadRoute();

    expect((await POST(tokenRequest())).status).toBe(503);
  });

  it("answers 403 for a cross-site request", async () => {
    const { POST } = await loadRoute();

    const response = await POST(tokenRequest("https://evil.example"));

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "forbidden" });
  });

  it("answers 401 when nobody is signed in", async () => {
    auth.user = null;
    const { POST } = await loadRoute();

    const response = await POST(tokenRequest());

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthorized" });
  });

  it("answers 429 with Retry-After once a user exceeds the limit", async () => {
    server.use(http.get(TOKEN_URL, () => HttpResponse.json({ token: "tok" })));
    const { POST } = await loadRoute();

    for (let i = 0; i < 5; i++) {
      expect((await POST(tokenRequest())).status).toBe(200);
    }
    const blocked = await POST(tokenRequest());

    expect(blocked.status).toBe(429);
    expect(await blocked.json()).toEqual({ error: "rate_limited" });
    expect(Number(blocked.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("answers 502 without leaking upstream details when ElevenLabs fails", async () => {
    server.use(
      http.get(TOKEN_URL, () =>
        HttpResponse.json({ detail: "invalid api key sk_..." }, { status: 401 }),
      ),
    );
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await loadRoute();

    const response = await POST(tokenRequest());

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ error: "upstream_error" });
    // The log carries the status only - nothing from the upstream body
    expect(logged).toHaveBeenCalledWith(
      "[voice] conversation token request failed: 401",
    );
  });

  it("answers 502 when ElevenLabs returns an unexpected body", async () => {
    server.use(http.get(TOKEN_URL, () => HttpResponse.json({ nope: true })));
    vi.spyOn(console, "error").mockImplementation(() => {});
    const { POST } = await loadRoute();

    expect((await POST(tokenRequest())).status).toBe(502);
  });
});
