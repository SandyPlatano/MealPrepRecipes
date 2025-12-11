"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { useEffect } from "react";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // #region agent log
  useEffect(() => {
    const htmlClass = document.documentElement.className;
    const htmlThemeAttr = document.documentElement.getAttribute("data-theme");
    const storedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") : null;
    fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'theme-provider.tsx:10',message:'ThemeProvider mounted - checking theme state',data:{htmlClass,htmlThemeAttr,storedTheme,defaultTheme:props.defaultTheme},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  }, []);
  // #endregion

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}