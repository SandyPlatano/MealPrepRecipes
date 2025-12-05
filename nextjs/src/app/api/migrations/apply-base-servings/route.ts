import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * API endpoint to apply the base_servings migration
 * 
 * This endpoint requires SUPABASE_SERVICE_ROLE_KEY to be set.
 * You can find this in your Supabase project settings under API > service_role key
 * 
 * Usage: POST /api/migrations/apply-base-servings
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST() {
  if (!SUPABASE_URL) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_SUPABASE_URL is not configured" },
      { status: 500 }
    );
  }

  if (!SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { 
        error: "SUPABASE_SERVICE_ROLE_KEY is not configured",
        hint: "Add SUPABASE_SERVICE_ROLE_KEY to your environment variables. You can find this in your Supabase project settings under API > service_role key"
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Read the migration SQL
    const migrationPath = join(process.cwd(), "supabase", "migrations", "007_add_base_servings.sql");
    const sql = readFileSync(migrationPath, "utf-8");

    // Execute the migration using the REST API
    // Note: Supabase JS client doesn't support DDL operations directly
    // We need to use the REST API with the service role key
    
    // Split SQL into individual statements
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    const results = [];

    for (const statement of statements) {
      if (statement.trim()) {
        // Use the REST API to execute SQL
        const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          },
          body: JSON.stringify({ query: statement }),
        });

        if (!response.ok) {
          // Try alternative: direct SQL execution via POST
          // This might not work for all DDL operations
          throw new Error(`Failed to execute statement: ${statement.substring(0, 50)}...`);
        }

        results.push({ statement: statement.substring(0, 50), success: true });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Migration applied successfully",
      statementsExecuted: results.length,
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Failed to apply migration",
        details: error.message,
        suggestion: "You may need to run this migration directly in the Supabase SQL Editor at https://supabase.com/dashboard/project/_/sql",
      },
      { status: 500 }
    );
  }
}

