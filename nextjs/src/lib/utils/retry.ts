/**
 * Retry utility with exponential backoff
 *
 * Use this for API calls that may fail transiently (network issues, rate limits, etc.)
 */

import { logger } from "@/lib/logger";

interface RetryOptions {
  /**
   * Maximum number of retry attempts (default: 3)
   */
  maxAttempts?: number;
  /**
   * Initial delay in milliseconds (default: 1000)
   */
  initialDelayMs?: number;
  /**
   * Maximum delay in milliseconds (default: 10000)
   */
  maxDelayMs?: number;
  /**
   * Multiplier for exponential backoff (default: 2)
   */
  backoffMultiplier?: number;
  /**
   * Custom function to determine if error is retryable (default: network/timeout errors)
   */
  isRetryable?: (error: unknown) => boolean;
  /**
   * Optional callback for each retry attempt
   */
  onRetry?: (attempt: number, error: unknown, nextDelayMs: number) => void;
}

/**
 * Default function to determine if an error is retryable
 */
function defaultIsRetryable(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("fetch failed") ||
      message.includes("aborted") ||
      // Rate limiting
      message.includes("too many requests") ||
      message.includes("rate limit")
    );
  }
  return false;
}

/**
 * Execute a function with retry logic and exponential backoff
 *
 * @example
 * ```typescript
 * const result = await withRetry(
 *   () => fetchFromExternalAPI(),
 *   { maxAttempts: 3 }
 * );
 * ```
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 1000,
    maxDelayMs = 10000,
    backoffMultiplier = 2,
    isRetryable = defaultIsRetryable,
    onRetry,
  } = options;

  let lastError: unknown;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (attempt >= maxAttempts || !isRetryable(error)) {
        throw error;
      }

      // Calculate next delay with jitter
      const jitter = Math.random() * 0.3 * delay; // 0-30% jitter
      const nextDelay = Math.min(delay + jitter, maxDelayMs);

      // Log retry attempt
      logger.warn(`Retry attempt ${attempt}/${maxAttempts}`, {
        error: error instanceof Error ? error.message : String(error),
        nextDelayMs: Math.round(nextDelay),
      });

      // Call retry callback if provided
      onRetry?.(attempt, error, nextDelay);

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, nextDelay));

      // Increase delay for next attempt
      delay = Math.min(delay * backoffMultiplier, maxDelayMs);
    }
  }

  throw lastError;
}

/**
 * Create a retry wrapper with preset options
 *
 * @example
 * ```typescript
 * const retryableAPICall = createRetry({ maxAttempts: 5 });
 * const result = await retryableAPICall(() => fetchData());
 * ```
 */
export function createRetry(
  defaultOptions: RetryOptions
): <T>(fn: () => Promise<T>, options?: RetryOptions) => Promise<T> {
  return <T>(fn: () => Promise<T>, options?: RetryOptions) =>
    withRetry(fn, { ...defaultOptions, ...options });
}

/**
 * Pre-configured retry for AI API calls (Anthropic, OpenAI, etc.)
 * These typically have rate limits and occasional transient failures
 */
export const withAIRetry = createRetry({
  maxAttempts: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
  isRetryable: (error) => {
    if (defaultIsRetryable(error)) return true;

    // Also retry on specific AI API errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes("overloaded") ||
        message.includes("capacity") ||
        message.includes("529") || // Anthropic overloaded
        message.includes("503") // Service unavailable
      );
    }
    return false;
  },
});

/**
 * Pre-configured retry for external HTTP calls
 */
export const withHTTPRetry = createRetry({
  maxAttempts: 3,
  initialDelayMs: 500,
  maxDelayMs: 5000,
});
