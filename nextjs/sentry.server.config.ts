import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://a45ae48506221fece9fc263ac4dd8b8d@o4510506408214528.ingest.us.sentry.io/4510506414768128",
  
  // Adjust this value in production, or use tracesSampler for finer control
  tracesSampleRate: 1.0,
  
  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
});

