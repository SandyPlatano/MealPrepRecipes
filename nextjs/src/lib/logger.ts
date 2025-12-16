/**
 * Structured logging utility for MealPrepRecipes
 *
 * In production: Outputs JSON for log aggregation (Vercel, etc.)
 * In development: Human-readable colored output
 * Integrates with Sentry for error reporting
 */

import * as Sentry from "@sentry/nextjs";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  userId?: string;
  householdId?: string;
  requestId?: string;
  action?: string;
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  data?: Record<string, unknown>;
}

const isProduction = process.env.NODE_ENV === "production";

class Logger {
  private context: LogContext = {};

  /**
   * Create a child logger with additional context
   */
  withContext(ctx: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.context = { ...this.context, ...ctx };
    return childLogger;
  }

  /**
   * Create a logger with user context (common pattern)
   */
  forUser(userId: string, householdId?: string): Logger {
    return this.withContext({ userId, householdId });
  }

  /**
   * Create a logger with request context
   */
  forRequest(requestId: string): Logger {
    return this.withContext({ requestId });
  }

  private formatEntry(entry: LogEntry): string {
    if (isProduction) {
      // JSON for log aggregation
      return JSON.stringify(entry);
    }

    // Human-readable for development
    const levelColors: Record<LogLevel, string> = {
      debug: "\x1b[36m", // cyan
      info: "\x1b[32m", // green
      warn: "\x1b[33m", // yellow
      error: "\x1b[31m", // red
    };
    const reset = "\x1b[0m";
    const color = levelColors[entry.level];

    let output = `${color}[${entry.level.toUpperCase()}]${reset} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }

    if (entry.data && Object.keys(entry.data).length > 0) {
      output += ` ${JSON.stringify(entry.data)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && !isProduction) {
        output += `\n  ${entry.error.stack}`;
      }
    }

    return output;
  }

  private log(
    level: LogLevel,
    message: string,
    data?: Record<string, unknown>,
    error?: Error | unknown
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
    };

    if (Object.keys(this.context).length > 0) {
      entry.context = this.context;
    }

    if (data && Object.keys(data).length > 0) {
      entry.data = data;
    }

    if (error) {
      if (error instanceof Error) {
        entry.error = {
          name: error.name,
          message: error.message,
          stack: error.stack,
        };
      } else {
        entry.error = {
          name: "UnknownError",
          message: String(error),
        };
      }
    }

    const formatted = this.formatEntry(entry);

    switch (level) {
      case "debug":
        // eslint-disable-next-line no-console
        if (!isProduction) console.debug(formatted);
        break;
      case "info":
        // eslint-disable-next-line no-console
        console.log(formatted);
        break;
      case "warn":
        // eslint-disable-next-line no-console
        console.warn(formatted);
        break;
      case "error":
        // eslint-disable-next-line no-console
        console.error(formatted);
        break;
    }
  }

  /**
   * Debug level - only shown in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    this.log("debug", message, data);
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: Record<string, unknown>): void {
    this.log("info", message, data);
  }

  /**
   * Warning level - potential issues
   */
  warn(message: string, data?: Record<string, unknown>): void {
    this.log("warn", message, data);
  }

  /**
   * Error level - captures error and sends to Sentry in production
   */
  error(
    message: string,
    error?: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.log("error", message, data, error);

    // Send to Sentry in production
    if (isProduction && error instanceof Error) {
      Sentry.withScope((scope) => {
        // Add context to Sentry
        if (this.context.userId) {
          scope.setUser({ id: this.context.userId });
        }
        if (this.context.requestId) {
          scope.setTag("request_id", this.context.requestId);
        }
        if (this.context.action) {
          scope.setTag("action", this.context.action);
        }

        // Add extra data
        scope.setExtras({
          ...this.context,
          ...data,
        });

        Sentry.captureException(error);
      });
    }
  }

  /**
   * Log an action start (useful for tracing)
   */
  actionStart(action: string, data?: Record<string, unknown>): void {
    this.info(`Starting: ${action}`, { ...data, action });
  }

  /**
   * Log an action completion
   */
  actionComplete(
    action: string,
    durationMs?: number,
    data?: Record<string, unknown>
  ): void {
    this.info(`Completed: ${action}`, {
      ...data,
      action,
      durationMs,
    });
  }

  /**
   * Log an action failure
   */
  actionFailed(
    action: string,
    error: Error | unknown,
    data?: Record<string, unknown>
  ): void {
    this.error(`Failed: ${action}`, error, { ...data, action });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating child loggers
export { Logger };
