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

  // Capture 100% of sessions with errors
  replaysOnErrorSampleRate: 1.0,

  // Sample 10% of sessions for general replay
  replaysSessionSampleRate: isProduction ? 0.1 : 0.5,

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Browser extensions and third-party scripts
    "ResizeObserver loop",
    "ResizeObserver loop limit exceeded",
    "Non-Error promise rejection",
    // Network errors that are expected
    "Failed to fetch",
    "Load failed",
    "NetworkError",
    // User-initiated navigation
    "AbortError",
    // Chrome extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
  ],

  // Filter out development and localhost URLs
  denyUrls: [
    /localhost/,
    /127\.0\.0\.1/,
    // Browser extensions
    /extensions\//i,
    /^chrome:\/\//i,
    /^moz-extension:\/\//i,
  ],

  // Integrations
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],

  // Before sending, filter out sensitive data
  beforeSend(event) {
    // Don't send events from development
    if (!isProduction && !process.env.NEXT_PUBLIC_SENTRY_DSN) {
      return null;
    }

    // Remove any potential PII from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map((breadcrumb) => {
        if (breadcrumb.data?.url) {
          // Remove query params that might contain sensitive data
          try {
            const url = new URL(breadcrumb.data.url);
            url.search = "";
            breadcrumb.data.url = url.toString();
          } catch {
            // Invalid URL, leave as is
          }
        }
        return breadcrumb;
      });
    }

    return event;
  },
});

