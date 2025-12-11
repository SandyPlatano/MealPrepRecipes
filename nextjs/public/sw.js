/// <reference lib="webworker" />

const CACHE_NAME = "whats-for-dinner-v5";
const OFFLINE_URL = "/offline";

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  "/offline",
];

// Install event - precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching app shell");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // Skip API routes (let them fail naturally for offline handling)
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Skip auth routes
  if (url.pathname.startsWith("/auth/")) {
    return;
  }

  // For all app routes, try network first, fall back to cache
  if (url.pathname.startsWith("/app/")) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Cache successful responses
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Network failed, try cache
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // No cache, return offline page
          const offlinePage = await caches.match(OFFLINE_URL);
          return offlinePage || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // For static assets, use cache-first strategy
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      (async () => {
        try {
          // Try cache first
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Not in cache, try network
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Network failed and no cache available
          // Return an empty response for non-critical assets
          return new Response("", {
            status: 503,
            statusText: "Service Unavailable",
          });
        }
      })()
    );
    return;
  }
});

// Listen for messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

