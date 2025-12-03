# Supabase Setup Guide

This guide will help you set up Supabase to enable shared data sync between you and your partner.

## Step 1: Create Supabase Account and Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Fill in:
   - **Name**: Your project name (e.g., "Meal Prep Recipes")
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose the closest region to you
4. Click "Create new project" and wait for it to finish setting up (takes ~2 minutes)

## Step 2: Run the Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New query"
3. Open the file `supabase-schema.sql` in this project
4. Copy and paste the entire contents into the SQL Editor
5. Click "Run" (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this means the tables were created successfully

## Step 3: Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** → **API** (left sidebar)
2. Find the **Project URL** - copy this value
3. Find the **anon public** key under "Project API keys" - copy this value

## Step 4: Configure the App

1. Open the Meal Prep Recipe Manager app
2. Go to the **Settings** tab
3. Scroll down to the **Supabase (Shared Data)** section
4. Paste your **Project URL** into the "Project URL" field
5. Paste your **anon public** key into the "Anon Key" field
6. Click **Save Settings**

## Step 5: Migrate Existing Data (Optional)

If you already have recipes, favorites, or cart items in your app:

1. After saving your Supabase credentials, click the **"Migrate Local Data to Supabase"** button
2. Wait for the migration to complete (you'll see a success message)
3. Your data is now synced to Supabase!

## Step 6: Share with Your Partner

1. Share your Supabase **Project URL** and **anon public** key with your partner
2. They should follow Step 4 above to configure the app with the same credentials
3. Once configured, you'll both see the same recipes, favorites, ratings, and cart!

## Troubleshooting

### "Error reading from Supabase" messages
- Make sure you ran the SQL schema (Step 2)
- Verify your Project URL and Anon Key are correct
- Check that your Supabase project is active (not paused)

### Data not syncing
- Both devices need to have the same Supabase credentials configured
- Try refreshing the page after making changes
- Check the browser console for any error messages

### Migration failed
- Make sure Supabase is configured correctly first
- Check that the SQL schema was run successfully
- Try the migration again - it's safe to run multiple times

## Security Note

The anon key provides public read/write access to your database. This is fine for a personal/couple app, but:
- Don't share your Supabase credentials publicly
- If you want to make this app public, consider adding proper authentication

## Need Help?

- Supabase Docs: https://supabase.com/docs
- Check the browser console for detailed error messages

