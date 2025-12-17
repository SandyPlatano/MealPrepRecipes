#!/usr/bin/env tsx
/**
 * Script to create a premium test user account
 * Usage: npx tsx scripts/create-premium-user.ts
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, "../.env.local") });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: Missing required environment variables");
  console.error("Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

// Create admin client
const adminClient = createSupabaseClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Create regular client for signup
const anonClient = createSupabaseClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function createPremiumUser() {
  const testEmail = "premium-test@example.com";
  const testPassword = "TestPassword123!";
  const testName = "Premium Test User";

  try {
    console.log(`Creating premium test user: ${testEmail}`);

    // Step 1: Create the user account
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName,
        },
      },
    });

    if (signUpError) {
      // Check if user already exists
      if (signUpError.message.includes("already registered") || signUpError.message.includes("already exists")) {
        console.log("User already exists, fetching existing user...");
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
          email: testEmail,
          password: testPassword,
        });

        if (signInError || !signInData.user) {
          console.error("Error signing in:", signInError?.message);
          console.log("\nPlease use a different email or reset the password for this account.");
          process.exit(1);
        }

        const userId = signInData.user.id;
        console.log(`Found existing user with ID: ${userId}`);

        // Step 2: Update subscription to premium
        await updateSubscriptionToPremium(userId);
        return;
      }

      console.error("Error creating user:", signUpError.message);
      process.exit(1);
    }

    if (!signUpData.user) {
      console.error("Error: User creation failed - no user returned");
      process.exit(1);
    }

    const userId = signUpData.user.id;
    console.log(`✓ User created with ID: ${userId}`);

    // Step 2: Update subscription to premium
    await updateSubscriptionToPremium(userId);

    console.log("\n✅ Premium test account created successfully!");
    console.log("\n📧 Login credentials:");
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: ${testPassword}`);
    console.log(`\n🌐 Login at: http://localhost:3000/login`);

  } catch (error) {
    console.error("Unexpected error:", error);
    process.exit(1);
  }
}

async function updateSubscriptionToPremium(userId: string) {
  console.log("\nUpdating subscription to premium...");

  // Check if subscription exists
  const { data: existingSub, error: checkError } = await adminClient
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (checkError && checkError.code !== "PGRST116") {
    console.error("Error checking subscription:", checkError);
    throw checkError;
  }

  if (existingSub) {
    // Update existing subscription
    const { error: updateError } = await adminClient
      .from("subscriptions")
      .update({
        tier: "premium",
        status: "active",
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    if (updateError) {
      console.error("Error updating subscription:", updateError);
      throw updateError;
    }
    console.log("✓ Subscription updated to premium");
  } else {
    // Create new subscription
    const { error: insertError } = await adminClient
      .from("subscriptions")
      .insert({
        user_id: userId,
        tier: "premium",
        status: "active",
        current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
      });

    if (insertError) {
      console.error("Error creating subscription:", insertError);
      throw insertError;
    }
    console.log("✓ Subscription created as premium");
  }

  // Update user_settings for unlimited AI suggestions (if columns exist)
  console.log("Updating user settings...");
  const { error: settingsError } = await adminClient
    .from("user_settings")
    .upsert({
      user_id: userId,
    }, {
      onConflict: "user_id",
    });

  // Try to update AI suggestions if column exists
  const { error: aiQuotaError } = await adminClient.rpc('exec_sql', {
    sql_query: `
      UPDATE user_settings 
      SET 
        ai_suggestions_remaining = 999,
        ai_suggestions_reset_at = NULL
      WHERE user_id = '${userId}'
      AND EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_settings' 
        AND column_name = 'ai_suggestions_remaining'
      );
    `
  }).catch(() => {
    // Ignore if RPC doesn't exist or column doesn't exist
    return { error: null };
  });

  if (settingsError) {
    console.error("Error updating user settings:", settingsError);
    // Don't throw - this is not critical
    console.log("⚠ Warning: Could not update user_settings, but subscription is set to premium");
  } else {
    console.log("✓ User settings updated");
    if (!aiQuotaError) {
      console.log("✓ AI suggestions quota set to unlimited (premium)");
    }
  }
}

// Run the script
createPremiumUser().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

