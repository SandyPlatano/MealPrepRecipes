/**
 * CSRF Protection Utilities
 *
 * Provides Origin-based CSRF protection for state-changing API routes.
 * This prevents cross-site request forgery attacks by validating that
 * requests originate from the same site.
 *
 * @security All state-changing API routes (POST, PUT, DELETE, PATCH)
 * should validate the request origin using these utilities.
 *
 * @example
 * ```ts
 * import { validateOrigin, CSRF_ERROR_RESPONSE } from '@/lib/security/csrf';
 *
 * export async function POST(request: Request) {
 *   if (!validateOrigin(request)) {
 *     return CSRF_ERROR_RESPONSE;
 *   }
 *   // ... handle request
 * }
 * ```
 */

import { NextResponse } from "next/server";

/**
 * Allowed origins for the application
 * In production, only the deployed domain is allowed
 * In development, localhost variants are also allowed
 */
function getAllowedOrigins(): string[] {
  const origins: string[] = [];

  // Production domain
  const productionUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (productionUrl) {
    origins.push(productionUrl);
    // Also allow without trailing slash
    origins.push(productionUrl.replace(/\/$/, ""));
  }

  // Vercel preview/production URLs
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    origins.push(`https://${vercelUrl}`);
  }

  // Development origins
  if (process.env.NODE_ENV === "development") {
    origins.push(
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    );
  }

  return origins;
}

/**
 * Validates that a request originated from an allowed origin
 *
 * @param request - The incoming request to validate
 * @returns true if the request origin is valid, false otherwise
 *
 * @security This function should be called at the start of all
 * state-changing API handlers (POST, PUT, DELETE, PATCH)
 */
export function validateOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  // Allow requests without origin header from same-origin navigation
  // (form submissions from same site may not include Origin)
  if (!origin) {
    // If there's no Origin, check Referer as fallback
    if (referer) {
      const allowedOrigins = getAllowedOrigins();
      return allowedOrigins.some((allowed) => referer.startsWith(allowed));
    }
    // Server-to-server requests (webhooks, cron jobs) may have neither
    // These should be authenticated via other means (API keys, bearer tokens)
    // For now, allow if neither is present (Next.js internal routing)
    return true;
  }

  const allowedOrigins = getAllowedOrigins();
  return allowedOrigins.includes(origin);
}

/**
 * Standard CSRF error response
 * Use this when origin validation fails
 */
export const CSRF_ERROR_RESPONSE = NextResponse.json(
  { error: "Invalid request origin" },
  { status: 403 }
);

/**
 * Higher-order function to wrap API handlers with CSRF protection
 *
 * @example
 * ```ts
 * import { withCsrfProtection } from '@/lib/security/csrf';
 *
 * const handler = async (request: Request) => {
 *   // ... your handler logic
 * };
 *
 * export const POST = withCsrfProtection(handler);
 * ```
 */
export function withCsrfProtection(
  handler: (request: Request) => Promise<Response>
): (request: Request) => Promise<Response> {
  return async (request: Request) => {
    if (!validateOrigin(request)) {
      return CSRF_ERROR_RESPONSE;
    }
    return handler(request);
  };
}

/**
 * Validates origin and throws if invalid
 * Use this at the start of API handlers for cleaner code
 *
 * @example
 * ```ts
 * export async function POST(request: Request) {
 *   const csrfError = assertValidOrigin(request);
 *   if (csrfError) return csrfError;
 *   // ... handle request
 * }
 * ```
 */
export function assertValidOrigin(request: Request): NextResponse | null {
  if (!validateOrigin(request)) {
    return CSRF_ERROR_RESPONSE;
  }
  return null;
}
