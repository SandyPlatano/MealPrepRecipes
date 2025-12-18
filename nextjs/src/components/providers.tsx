"use client";

import dynamic from "next/dynamic";
import { CartProvider } from "@/components/cart";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

// Dynamic import for global search to avoid SSR issues
const GlobalSearchProvider = dynamic(
  () => import("@/contexts/global-search-context").then((mod) => mod.GlobalSearchProvider),
  { ssr: false }
);
const GlobalSearchModal = dynamic(
  () => import("@/components/global-search").then((mod) => mod.GlobalSearchModal),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      <TooltipProvider delayDuration={0}>
        <GlobalSearchProvider>
          <CartProvider>
            {children}
            <ServiceWorkerRegistration />
            <KeyboardShortcutsProvider />
            <GlobalSearchModal />
          </CartProvider>
        </GlobalSearchProvider>
      </TooltipProvider>
    </ThemeProvider>
  );
}
