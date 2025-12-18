/**
 * Query monitoring utility for tracking Supabase query performance and errors.
 *
 * Features:
 * - Tracks query execution time
 * - Logs slow queries (>500ms)
 * - Logs errors with full context
 * - Non-blocking (uses Promise.resolve for async logging)
 * - Works in production without external dependencies
 * - Easy to extend for external monitoring services (DataDog, Sentry, etc.)
 */

export interface QueryMetadata {
  table?: string;
  operation?: string;
  filter?: string;
  select?: string;
}

export interface QueryError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

interface QueryLogEntry {
  timestamp: string;
  duration: number;
  metadata: QueryMetadata;
  error?: QueryError;
  isSlowQuery: boolean;
}

const SLOW_QUERY_THRESHOLD_MS = 500;
const isDev = process.env.NODE_ENV === 'development';

/**
 * Tracks query execution time and logs slow queries or errors.
 * This function is non-blocking and will not slow down query execution.
 *
 * @param queryFn - The async function that executes the query
 * @param metadata - Metadata about the query (table, operation, etc.)
 * @returns The result of the query function
 */
export async function trackQuery<T>(
  queryFn: () => Promise<T>,
  metadata: QueryMetadata
): Promise<T> {
  const startTime = performance.now();
  const timestamp = new Date().toISOString();

  try {
    const result = await queryFn();
    const duration = performance.now() - startTime;
    const isSlowQuery = duration > SLOW_QUERY_THRESHOLD_MS;

    // Log slow queries (non-blocking)
    if (isSlowQuery) {
      Promise.resolve().then(() => {
        logSlowQuery({ timestamp, duration, metadata, isSlowQuery });
      });
    }

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;

    // Log error (non-blocking)
    Promise.resolve().then(() => {
      const queryError = normalizeError(error);
      logQueryError({ timestamp, duration, metadata, error: queryError, isSlowQuery: false });
    });

    // Re-throw the original error
    throw error;
  }
}

/**
 * Logs a slow query to the console (or external service in the future).
 */
function logSlowQuery(entry: QueryLogEntry): void {
  const { table = 'unknown', operation = 'unknown' } = entry.metadata;

  if (isDev) {
    console.warn(
      `[SLOW QUERY] ${entry.duration.toFixed(2)}ms - ${operation} on ${table}`,
      {
        timestamp: entry.timestamp,
        metadata: entry.metadata,
      }
    );
  } else {
    // In production, use JSON format for easier parsing by log aggregators
    console.warn(
      JSON.stringify({
        type: 'slow_query',
        timestamp: entry.timestamp,
        duration: entry.duration,
        table,
        operation,
        metadata: entry.metadata,
      })
    );
  }

  // Future: Send to external monitoring service
  // sendToDataDog(entry);
  // sendToSentry(entry);
}

/**
 * Logs a query error with full context.
 */
function logQueryError(entry: QueryLogEntry): void {
  const { table = 'unknown', operation = 'unknown' } = entry.metadata;

  if (isDev) {
    console.error(
      `[QUERY ERROR] ${operation} on ${table} failed after ${entry.duration.toFixed(2)}ms`,
      {
        timestamp: entry.timestamp,
        metadata: entry.metadata,
        error: entry.error,
      }
    );
  } else {
    // In production, use JSON format for easier parsing by log aggregators
    console.error(
      JSON.stringify({
        type: 'query_error',
        timestamp: entry.timestamp,
        duration: entry.duration,
        table,
        operation,
        metadata: entry.metadata,
        error: entry.error,
      })
    );
  }

  // Future: Send to external monitoring service
  // sendToDataDog(entry);
  // captureException(entry.error);
}

/**
 * Normalizes various error types into a consistent QueryError format.
 */
function normalizeError(error: unknown): QueryError {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: (error as { code?: string }).code,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
    };
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>;
    return {
      message: String(obj.message || 'Unknown error'),
      code: obj.code ? String(obj.code) : undefined,
      details: obj.details ? String(obj.details) : undefined,
      hint: obj.hint ? String(obj.hint) : undefined,
    };
  }

  return {
    message: String(error),
  };
}
