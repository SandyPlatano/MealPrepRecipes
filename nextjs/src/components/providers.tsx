"use client";

import { CartProvider } from "@/components/cart";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <CartProvider>
        {children}
        <ServiceWorkerRegistration />
      </CartProvider>
    </ThemeProvider>
  );
}
