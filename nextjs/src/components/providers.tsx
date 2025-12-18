"use client";

import { CartProvider } from "@/components/cart";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import { GlobalSearchProvider } from "@/contexts/global-search-context";
import { GlobalSearchModal } from "@/components/global-search";

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
