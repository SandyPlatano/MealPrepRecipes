"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("Service Worker registered with scope:", registration.scope);
          }
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("Service Worker registration failed:", error);
          }
        });
    }
  }, []);

  return null;
}

