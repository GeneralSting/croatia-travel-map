"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "./components/auth/AuthProvider";

/**
 * app wide client providers
 * TanStack Query is our client-side cache for server state (per user progress)
 * it dedupes requests and keeps the UI response as the dataset grows
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  /**
   * wrapping the QueryClient in the useState with an initializer function guarantees that each user gets their own
   * isolated instance of the cache created exactly once when the page is loaded
   * this way we avoid instantiating query client globally that can lead to sharing data between users on the server -
   * massive securty leaks avoided
   */
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 120_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
