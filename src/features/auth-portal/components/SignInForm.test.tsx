import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { SignInForm } from "./SignInForm";

// *** Integration tests ***

/**
 * next/navigation only works inside Next's app runtime, so we mock it.
 * vi.hoisted lets the mock factory which is hoisted reference these spies safely.
 */
const nav = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push, refresh: nav.refresh }),
  useSearchParams: () => new URLSearchParams(),
}));

const TOKEN_ENDPOINT = "https://test.supabase.co/auth/v1/token";

// A minimal-but-valid session payload, the shape Supabase returns from a successful password login.
function sessionResponse(email: string) {
  return {
    access_token: "test-access-token",
    token_type: "bearer",
    expires_in: 3600,
    refresh_token: "test-refresh-token",
    user: {
      id: "00000000-0000-0000-0000-000000000001",
      aud: "authenticated",
      role: "authenticated",
      email,
      app_metadata: { provider: "email", providers: ["email"] },
      user_metadata: {},
      created_at: "2020-01-01T00:00:00Z",
    },
  };
}

function fillAndSubmit(email: string, password: string) {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /login/i }));
}

describe("SignInForm", () => {
  beforeEach(() => {
    nav.push.mockReset();
    nav.refresh.mockReset();
  });

  it("logs in with valid credentials and navigates home", async () => {
    // Arrange: the auth endpoint accepts this login
    server.use(
      http.post(TOKEN_ENDPOINT, () =>
        HttpResponse.json(sessionResponse("user@example.com")),
      ),
    );
    render(<SignInForm />);

    fillAndSubmit("user@example.com", "correct-horse");

    // Assert: on success the form sends the user to the map home.
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/"));
  });

  it("shows the server's error message when credentials are wrong", async () => {
    // Arrange: the endpoint rejects, exactly as Supabase does for a bad password
    server.use(
      http.post(TOKEN_ENDPOINT, () =>
        HttpResponse.json(
          {
            error: "invalid_grant",
            error_description: "Invalid login credentials",
          },
          { status: 400 },
        ),
      ),
    );
    render(<SignInForm />);

    fillAndSubmit("user@example.com", "wrong-password");

    // Assert: the message surfaces and we do NOT navigate away
    expect(await screen.findByText(/invalid login credentials/i)).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("validates the form before calling the network (invalid email)", async () => {
    /**
     * No handler needed: validation should stop the submit before any request.
     * If the code regressed and called the network, MSW's onUnhandledRequest:"error" would fail this test
     */
    render(<SignInForm />);

    fillAndSubmit("not-an-email", "correct-horse");

    expect(await screen.findByText(/valid email/i)).toBeTruthy();
    expect(nav.push).not.toHaveBeenCalled();
  });
});
