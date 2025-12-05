#!/usr/bin/env tsx
/**
 * Migration Runner Script
 * 
 * This script runs SQL migrations from the supabase/migrations directory.
 * 
 * Usage:
 *   npx tsx scripts/run-migration.ts <migration-file-name>
 * 
 * Example:
 *   npx tsx scripts/run-migration.ts 007_add_base_servings.sql
 * 
 * Note: This requires SUPABASE_SERVICE_ROLE_KEY to be set in your environment.
 * You can find this in your Supabase project settings under API.
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { join } from "path";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL is not set in your environment");
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ SUPABASE_SERVICE_ROLE_KEY is not set in your environment");
  console.error("   You can find this in your Supabase project settings under API > service_role key");
  console.error("   Or you can run the migration directly in the Supabase SQL Editor.");
  process.exit(1);
}

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Please provide a migration file name");
  console.error("   Usage: npx tsx scripts/run-migration.ts <migration-file-name>");
  process.exit(1);
}

async function runMigration() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const migrationPath = join(process.cwd(), "supabase", "migrations", migrationFile);
  
  let sql: string;
  try {
    sql = readFileSync(migrationPath, "utf-8");
  } catch (error) {
    console.error(`❌ Could not read migration file: ${migrationPath}`);
    console.error(error);
    process.exit(1);
  }

  console.log(`📄 Running migration: ${migrationFile}`);
  console.log("---");
  
  try {
    // Split by semicolons and execute each statement
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        console.log(`Executing: ${statement.substring(0, 50)}...`);
        const { error } = await supabase.rpc("exec_sql", { sql_query: statement });
        
        // If RPC doesn't work, try direct query (though this might not work for DDL)
        // We'll need to use the REST API for DDL operations
        if (error) {
          console.warn(`⚠️  RPC method failed, trying alternative approach...`);
          // For DDL operations, we need to use the REST API or psql
          // This is a limitation - DDL operations need direct database access
          console.error("❌ Cannot execute DDL operations via Supabase client");
          console.error("   Please run this migration in the Supabase SQL Editor:");
          console.error(`   File: ${migrationPath}`);
          process.exit(1);
        }
      }
    }

    console.log("✅ Migration completed successfully!");
  } catch (error) {
    console.error("❌ Error running migration:");
    console.error(error);
    process.exit(1);
  }
}

runMigration();

