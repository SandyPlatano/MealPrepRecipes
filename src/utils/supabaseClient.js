/**
 * Supabase client initialization
 * Falls back gracefully if Supabase is not configured
 */

import { createClient } from '@supabase/supabase-js';
import { storage } from './localStorage';

let supabaseClient = null;

/**
 * Initialize Supabase client from settings
 * Returns null if Supabase is not configured
 */
export function getSupabaseClient() {
  // Return cached client if already initialized
  if (supabaseClient !== null) {
    return supabaseClient;
  }

  // Get settings from localStorage (SettingsContext may not be available yet)
  const settings = storage.settings.get();
  const supabaseUrl = settings?.supabaseUrl?.trim();
  const supabaseAnonKey = settings?.supabaseAnonKey?.trim();

  // Return null if not configured (will fall back to localStorage)
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Create and cache client
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    return supabaseClient;
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
    return null;
  }
}

/**
 * Reset the Supabase client (useful when settings change)
 */
export function resetSupabaseClient() {
  supabaseClient = null;
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured() {
  const settings = storage.settings.get();
  const supabaseUrl = settings?.supabaseUrl?.trim();
  const supabaseAnonKey = settings?.supabaseAnonKey?.trim();
  return !!(supabaseUrl && supabaseAnonKey);
}

