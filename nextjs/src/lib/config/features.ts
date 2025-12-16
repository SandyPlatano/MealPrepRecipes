/**
 * Feature flags configuration
 *
 * IMPORTANT: DEVELOPMENT_PREMIUM_OVERRIDE must be explicitly set in .env
 * It is NOT auto-detected from localhost to prevent accidental premium access
 */

export const FEATURE_FLAGS = {
  /**
   * When true, bypasses all subscription checks and grants premium access.
   * This should ONLY be set in local development environments.
   *
   * WARNING: Never set this in production!
   */
  DEVELOPMENT_PREMIUM_OVERRIDE:
    process.env.DEVELOPMENT_PREMIUM_OVERRIDE === "true",

  /**
   * Enable verbose logging for debugging
   */
  DEBUG_LOGGING: process.env.DEBUG_LOGGING === "true",
} as const;

/**
 * Environment configuration
 */
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  APP_ENV: process.env.APP_ENV || "development",

  isProduction: process.env.APP_ENV === "production",
  isStaging: process.env.APP_ENV === "staging",
  isDevelopment:
    process.env.APP_ENV === "development" || !process.env.APP_ENV,
} as const;

// Runtime validation - prevent DEVELOPMENT_PREMIUM_OVERRIDE in production
if (ENV.isProduction && FEATURE_FLAGS.DEVELOPMENT_PREMIUM_OVERRIDE) {
  throw new Error(
    "FATAL: DEVELOPMENT_PREMIUM_OVERRIDE cannot be true in production! " +
      "This would give all users premium access. Remove this from your production environment."
  );
}
