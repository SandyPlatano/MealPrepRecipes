/**
 * Server-side check if running on localhost
 * Checks environment variables and headers
 */

export function isLocalhostServer(headers?: Headers): boolean {
  // Check environment variable first
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  if (appUrl.includes("localhost") || appUrl.includes("127.0.0.1") || !appUrl) {
    return true;
  }

  // Check headers if provided
  if (headers) {
    const host = headers.get("host") || "";
    if (host.includes("localhost") || host.includes("127.0.0.1")) {
      return true;
    }
  }

  return false;
}

