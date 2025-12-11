"use client";

import { useState, useEffect, useCallback } from "react";

export function useOffline() {
  // Start with null to indicate we haven't checked yet (avoids false positive on SSR)
  const [isOffline, setIsOffline] = useState<boolean | null>(null);
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          if (process.env.NODE_ENV === 'development') {
            console.log("[App] Service worker registered:", registration.scope);
          }
          setIsServiceWorkerReady(true);

          // Check for updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (
                  newWorker.state === "installed" &&
                  navigator.serviceWorker.controller
                ) {
                  // New service worker available
                  if (process.env.NODE_ENV === 'development') {
                    console.log("[App] New service worker available");
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          if (process.env.NODE_ENV === 'development') {
            console.error("[App] Service worker registration failed:", error);
          }
        });
    }
  }, []);

  // Return false if we haven't checked yet (null) to avoid showing offline banner prematurely
  return { isOffline: isOffline === true, isServiceWorkerReady };
}

// Local storage helper for offline data persistence
const SHOPPING_LIST_CACHE_KEY = "offline_shopping_list";

export interface CachedShoppingList {
  items: Array<{
    id: string;
    ingredient: string;
    quantity?: string | null;
    unit?: string | null;
    category?: string | null;
    is_checked: boolean;
    recipe_title?: string | null;
  }>;
  lastUpdated: string;
  pendingChanges: Array<{
    type: "toggle" | "add" | "remove";
    itemId?: string;
    item?: {
      ingredient: string;
      quantity?: string;
      unit?: string;
      category?: string;
    };
    timestamp: string;
  }>;
}

export function getCachedShoppingList(): CachedShoppingList | null {
  if (typeof window === "undefined") return null;
  
  try {
    const cached = localStorage.getItem(SHOPPING_LIST_CACHE_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[Offline] Failed to read cache:", error);
    }
  }
  return null;
}

export function setCachedShoppingList(data: CachedShoppingList): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(SHOPPING_LIST_CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("[Offline] Failed to write cache:", error);
    }
  }
}

export function addPendingChange(
  change: CachedShoppingList["pendingChanges"][0]
): void {
  const cached = getCachedShoppingList();
  if (cached) {
    cached.pendingChanges.push(change);
    setCachedShoppingList(cached);
  }
}

export function clearPendingChanges(): void {
  const cached = getCachedShoppingList();
  if (cached) {
    cached.pendingChanges = [];
    setCachedShoppingList(cached);
  }
}

export function useSyncOnReconnect(
  onSync: () => Promise<void>
): { syncNow: () => Promise<void> } {
  const syncNow = useCallback(async () => {
    const cached = getCachedShoppingList();
    if (cached && cached.pendingChanges.length > 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          "[Offline] Syncing",
          cached.pendingChanges.length,
          "pending changes"
        );
      }
      await onSync();
      clearPendingChanges();
    }
  }, [onSync]);

  useEffect(() => {
    const handleOnline = () => {
      console.log("[Offline] Back online, syncing changes...");
      syncNow();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [syncNow]);

  return { syncNow };
}

