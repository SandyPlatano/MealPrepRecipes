/**
 * Supabase storage API that mirrors localStorage interface
 * Falls back to localStorage if Supabase is not configured
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { storage as localStorage } from './localStorage';

/**
 * Map Supabase table names to localStorage keys
 */
const tableToStorageKey = {
  recipes: 'recipes',
  favorites: 'favorites',
  cart: 'cart',
  cooking_history: 'history',
  templates: 'templates',
};

/**
 * Generic function to get data from Supabase or localStorage
 */
async function getData(tableName, defaultValue = null) {
  const storageKey = tableToStorageKey[tableName] || tableName;
  
  if (!isSupabaseConfigured()) {
    // Fall back to localStorage
    return localStorage[storageKey]?.get() || defaultValue;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return localStorage[storageKey]?.get() || defaultValue;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('data')
      .single();

    if (error) {
      // If no row exists, return default
      if (error.code === 'PGRST116') {
        return defaultValue;
      }
      console.error(`Error reading from Supabase table "${tableName}":`, error);
      // Fall back to localStorage on error
      return localStorage[storageKey]?.get() || defaultValue;
    }

    return data?.data || defaultValue;
  } catch (error) {
    console.error(`Error reading from Supabase table "${tableName}":`, error);
    return localStorage[storageKey]?.get() || defaultValue;
  }
}

/**
 * Generic function to set data in Supabase or localStorage
 */
async function setData(tableName, value) {
  const storageKey = tableToStorageKey[tableName] || tableName;
  
  if (!isSupabaseConfigured()) {
    // Fall back to localStorage
    return localStorage[storageKey]?.set(value);
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return localStorage[storageKey]?.set(value);
  }

  try {
    // Use upsert to insert or update
    const { error } = await supabase
      .from(tableName)
      .upsert({ id: 1, data: value }, { onConflict: 'id' });

    if (error) {
      console.error(`Error writing to Supabase table "${tableName}":`, error);
      // Also save to localStorage as backup
      localStorage[storageKey]?.set(value);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error writing to Supabase table "${tableName}":`, error);
    // Also save to localStorage as backup
    localStorage[storageKey]?.set(value);
    return false;
  }
}

/**
 * Supabase storage API matching localStorage interface
 */
export const supabaseStorage = {
  recipes: {
    get: async () => await getData('recipes', []),
    set: async (recipes) => await setData('recipes', recipes),
  },
  favorites: {
    get: async () => await getData('favorites', []),
    set: async (favorites) => await setData('favorites', favorites),
  },
  cart: {
    get: async () => await getData('cart', []),
    set: async (cart) => await setData('cart', cart),
  },
  history: {
    get: async () => await getData('cooking_history', []),
    set: async (history) => await setData('cooking_history', history),
  },
  templates: {
    get: async () => await getData('templates', []),
    set: async (templates) => await setData('templates', templates),
  },
};

/**
 * Check if we should use Supabase or localStorage
 */
export function shouldUseSupabase() {
  return isSupabaseConfigured();
}

/**
 * Migrate data from localStorage to Supabase
 * This is a one-time operation
 */
export async function migrateToSupabase() {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, cannot migrate');
    return false;
  }

  try {
    // Get all data from localStorage
    const recipes = localStorage.recipes.get();
    const favorites = localStorage.favorites.get();
    const cart = localStorage.cart.get();
    const history = localStorage.history.get();
    const templates = localStorage.templates.get();

    // Upload to Supabase
    await Promise.all([
      supabaseStorage.recipes.set(recipes),
      supabaseStorage.favorites.set(favorites),
      supabaseStorage.cart.set(cart),
      supabaseStorage.history.set(history),
      supabaseStorage.templates.set(templates),
    ]);

    console.log('Migration to Supabase completed successfully');
    return true;
  } catch (error) {
    console.error('Error migrating to Supabase:', error);
    return false;
  }
}

