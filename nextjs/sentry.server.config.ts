import * as Sentry from "@sentry/nextjs";

const isProduction = process.env.NODE_ENV === "production";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://a45ae48506221fece9fc263ac4dd8b8d@o4510506408214528.ingest.us.sentry.io/4510506414768128",

  // Environment and release tracking
  environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
  release: process.env.VERCEL_GIT_COMMIT_SHA || "development",

  // Sample 10% of transactions in production, 100% in development
  tracesSampleRate: isProduction ? 0.1 : 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Database connection issues that auto-recover
    "connection terminated unexpectedly",
    // Rate limiting responses
    "Too many requests",
  ],

  // Before sending, add context
  beforeSend(event) {
    // Don't send events from development unless explicitly configured
    if (!isProduction && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    return event;
  },
});

