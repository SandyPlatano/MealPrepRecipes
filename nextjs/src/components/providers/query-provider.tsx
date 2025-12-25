"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

/**
 * React Query provider with optimized default settings for the meal prep app.
 *
 * Key configurations:
 * - staleTime: 5 minutes - data is considered fresh and won't refetch
 * - gcTime: 30 minutes - unused data stays in cache for quick access
 * - refetchOnWindowFocus: false - prevents unexpected refetches
 * - retry: 1 - single retry on failure to balance UX and network
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  // Create QueryClient inside useState to ensure single instance per component lifecycle
  // This prevents issues with SSR and ensures client-side stability
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data stays fresh for 5 minutes - reduces unnecessary refetches
            staleTime: 5 * 60 * 1000,
            // Keep unused data in cache for 30 minutes
            gcTime: 30 * 60 * 1000,
            // Don't refetch when window regains focus
            refetchOnWindowFocus: false,
            // Don't refetch when reconnecting
            refetchOnReconnect: false,
            // Single retry on failure
            retry: 1,
          },
          mutations: {
            // Mutations should retry once on failure
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* DevTools only render in development */}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
}
