/**
 * Check if the app is running on localhost
 * Useful for showing development-only features
 */

export function isLocalhost(): boolean {
  if (typeof window === "undefined") {
    // Server-side: check environment variable or headers
    const host = process.env.NEXT_PUBLIC_APP_URL || "";
    return host.includes("localhost") || host.includes("127.0.0.1") || !host;
  }
  
  // Client-side: check window location
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "[::1]"
  );
}

