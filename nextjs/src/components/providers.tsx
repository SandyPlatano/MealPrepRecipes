"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";
import { RecipePickerProvider } from "@/contexts/recipe-picker-context";
import { QueryProvider } from "@/components/providers/query-provider";

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
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
        storageKey="theme"
      >
        <TooltipProvider delayDuration={0}>
          <RecipePickerProvider>
            <GlobalSearchProvider>
              {children}
              <ServiceWorkerRegistration />
              <KeyboardShortcutsProvider />
              <GlobalSearchModal />
            </GlobalSearchProvider>
          </RecipePickerProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
