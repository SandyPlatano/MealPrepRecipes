"use client";

import { CartProvider } from "@/components/cart";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { KeyboardShortcutsProvider } from "@/components/keyboard-shortcuts-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
    >
      <CartProvider>
        {children}
        <ServiceWorkerRegistration />
        <KeyboardShortcutsProvider />
      </CartProvider>
    </ThemeProvider>
  );
}
