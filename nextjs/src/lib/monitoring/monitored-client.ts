/**
 * Monitored Supabase client wrapper.
 *
 * This wraps the Supabase client to add query performance monitoring without
 * changing the API. It's a drop-in replacement that tracks query timing and errors.
 *
 * Usage:
 *   const client = createMonitoredClient(supabaseClient);
 *   // Use exactly like a normal Supabase client
 *   const { data } = await client.from('users').select('*').eq('id', userId);
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { trackQuery, type QueryMetadata } from './query-monitor';

/**
 * Creates a monitored version of a Supabase client.
 * The monitored client tracks query performance and logs slow queries/errors.
 *
 * @param client - The Supabase client to monitor
 * @returns A proxied client that adds monitoring to all queries
 */
export function createMonitoredClient<T = unknown>(
  client: SupabaseClient<T>
): SupabaseClient<T> {
  // Wrap the from() method to intercept table queries
  const originalFrom = client.from.bind(client);

  // Create a proxy that intercepts the from() method
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'from') {
        return (table: string) => {
          const queryBuilder = originalFrom(table);
          return wrapQueryBuilder(queryBuilder, { table });
        };
      }

      // Pass through all other properties unchanged
      return Reflect.get(target, prop, receiver);
    },
  });
}

/**
 * Wraps a query builder to track its execution.
 * This intercepts terminal methods like .then() to measure query performance.
 */
function wrapQueryBuilder<T>(builder: T, metadata: QueryMetadata): T {
  return new Proxy(builder as object, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      // Intercept methods that build the query
      if (typeof value === 'function') {
        // Track which methods are called to build better metadata
        if (prop === 'select') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            const select = args[0] as string | undefined;
            return wrapQueryBuilder(result, {
              ...metadata,
              operation: 'select',
              select: select || '*',
            });
          };
        }

        if (prop === 'insert') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            return wrapQueryBuilder(result, {
              ...metadata,
              operation: 'insert',
            });
          };
        }

        if (prop === 'update') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            return wrapQueryBuilder(result, {
              ...metadata,
              operation: 'update',
            });
          };
        }

        if (prop === 'delete') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            return wrapQueryBuilder(result, {
              ...metadata,
              operation: 'delete',
            });
          };
        }

        if (prop === 'upsert') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            return wrapQueryBuilder(result, {
              ...metadata,
              operation: 'upsert',
            });
          };
        }

        if (prop === 'eq' || prop === 'neq' || prop === 'gt' || prop === 'lt' ||
            prop === 'gte' || prop === 'lte' || prop === 'like' || prop === 'ilike' ||
            prop === 'is' || prop === 'in' || prop === 'contains') {
          return (...args: unknown[]) => {
            const result = value.apply(target, args);
            const column = args[0] as string;
            const filterValue = args[1];
            const currentFilter = metadata.filter || '';
            const newFilter = currentFilter
              ? `${currentFilter}, ${column} ${String(prop)} ${String(filterValue)}`
              : `${column} ${String(prop)} ${String(filterValue)}`;
            return wrapQueryBuilder(result, {
              ...metadata,
              filter: newFilter,
            });
          };
        }

        // Intercept .then() which is called when the query executes
        if (prop === 'then') {
          return (onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) => {
            // Wrap the query execution with tracking
            const trackedPromise = trackQuery(
              async () => {
                // Execute the original query
                return await (target as Promise<unknown>);
              },
              metadata
            );

            // Forward to the tracked promise's .then()
            return trackedPromise.then(onFulfilled, onRejected);
          };
        }

        // For all other methods, wrap the result if it's chainable
        return (...args: unknown[]) => {
          const result = value.apply(target, args);

          // If the result is an object (chainable), wrap it
          if (result && typeof result === 'object') {
            return wrapQueryBuilder(result, metadata);
          }

          return result;
        };
      }

      return value;
    },
  }) as T;
}
