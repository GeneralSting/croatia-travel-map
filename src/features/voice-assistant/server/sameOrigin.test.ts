import { describe, expect, it } from "vitest";
import { isSameOrigin } from "./sameOrigin";

const request = (headers: Record<string, string>) =>
  new Request("http://localhost:3000/api/voice/token", {
    method: "POST",
    headers,
  });

describe("isSameOrigin", () => {
  it("accepts a request whose Origin matches the Host", () => {
    expect(
      isSameOrigin(request({ origin: "http://localhost:3000", host: "localhost:3000" })),
    ).toBe(true);
  });

  it("rejects another site's Origin", () => {
    expect(
      isSameOrigin(request({ origin: "https://evil.example", host: "localhost:3000" })),
    ).toBe(false);
  });

  it("rejects a request without an Origin header", () => {
    expect(isSameOrigin(request({ host: "localhost:3000" }))).toBe(false);
  });

  it("uses X-Forwarded-Host behind a proxy", () => {
    expect(
      isSameOrigin(
        request({
          origin: "https://croatia.example",
          host: "internal:8080",
          "x-forwarded-host": "croatia.example",
        }),
      ),
    ).toBe(true);
  });

  it("rejects a malformed Origin such as 'null'", () => {
    expect(isSameOrigin(request({ origin: "null", host: "localhost:3000" }))).toBe(false);
  });
});
