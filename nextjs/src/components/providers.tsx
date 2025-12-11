"use client";

import { CartProvider } from "@/components/cart";
import { ThemeProvider } from "@/components/theme-provider";
import { ServiceWorkerRegistration } from "@/components/service-worker-registration";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // #region agent log
  useEffect(() => {
    const isSSR = typeof window === "undefined";
    const htmlClass = !isSSR ? document.documentElement.className : "N/A";
    const htmlThemeAttr = !isSSR ? document.documentElement.getAttribute("data-theme") : "N/A";
    fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'providers.tsx:12',message:'Providers render - ThemeProvider init',data:{isSSR,htmlClass,htmlThemeAttr,hasWindow:typeof window !== 'undefined'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion

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
      </CartProvider>
    </ThemeProvider>
  );
}
