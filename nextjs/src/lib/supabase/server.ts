import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createMonitoredClient } from "@/lib/monitoring/monitored-client";

const ENABLE_QUERY_MONITORING = process.env.ENABLE_QUERY_MONITORING === 'true';

export async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Optionally wrap with monitoring
  if (ENABLE_QUERY_MONITORING) {
    return createMonitoredClient(client);
  }

  return client;
}

/**
 * Creates an admin Supabase client with service role key.
 * Use this ONLY for admin operations like deleting users.
 * NEVER expose this client or its responses to the frontend.
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  // Optionally wrap with monitoring
  if (ENABLE_QUERY_MONITORING) {
    return createMonitoredClient(client);
  }

  return client;
}
