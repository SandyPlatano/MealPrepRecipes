"use client";

import { useEffect } from "react";

export function LayoutDebug() {
  useEffect(() => {
    const htmlClass = document.documentElement.className;
    const htmlThemeAttr = document.documentElement.getAttribute("data-theme");
    const bodyClass = document.body.className;
    fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout-debug.tsx:8',message:'LayoutDebug - CLIENT hydration check',data:{htmlClass,htmlThemeAttr,bodyClass,isSSR:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});

    // Listen for React hydration errors
    const originalError = console.error;
    console.error = (...args) => {
      const errorMsg = args.join(' ');
      if (errorMsg.includes('hydration') || errorMsg.includes('Hydration') || errorMsg.includes('did not match')) {
        fetch('http://127.0.0.1:7242/ingest/e7393dc2-767c-4b48-9410-102b5c37a0a3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'layout-debug.tsx:15',message:'HYDRATION ERROR DETECTED',data:{errorMsg,htmlClass:document.documentElement.className,htmlThemeAttr:document.documentElement.getAttribute("data-theme")},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'ALL'})}).catch(()=>{});
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return null;
}
