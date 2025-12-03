/**
 * Supabase Storage service for uploading and retrieving files
 * Used for hosting shopping list files that can be downloaded from emails
 */

import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';

const SHOPPING_LISTS_BUCKET = 'shopping-lists';

/**
 * Upload a shopping list file to Supabase Storage
 * @param {string} content - The file content (markdown or HTML)
 * @param {string} filename - The filename (e.g., 'shopping-list-2025-12-08.md')
 * @param {string} contentType - MIME type (e.g., 'text/markdown' or 'text/html')
 * @returns {Promise<{success: boolean, url: string|null, error: string|null}>}
 */
export async function uploadShoppingListFile(content, filename, contentType = 'text/markdown') {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      url: null,
      error: 'Supabase is not configured. Please configure Supabase in Settings to enable file downloads.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      url: null,
      error: 'Failed to initialize Supabase client.',
    };
  }

  try {
    // Convert content to Blob
    const blob = new Blob([content], { type: contentType });
    
    // Upload to Supabase Storage
    // Use a unique filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;
    const filePath = `lists/${uniqueFilename}`;

    const { data, error } = await supabase.storage
      .from(SHOPPING_LISTS_BUCKET)
      .upload(filePath, blob, {
        contentType,
        upsert: false, // Don't overwrite existing files
      });

    if (error) {
      // Check if bucket doesn't exist
      if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
        return {
          success: false,
          url: null,
          error: `Storage bucket '${SHOPPING_LISTS_BUCKET}' not found. Please create it in your Supabase dashboard (Storage section).`,
        };
      }
      
      console.error('Error uploading to Supabase Storage:', error);
      return {
        success: false,
        url: null,
        error: error.message || 'Failed to upload file to Supabase Storage.',
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(SHOPPING_LISTS_BUCKET)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return {
        success: false,
        url: null,
        error: 'Failed to get public URL for uploaded file.',
      };
    }

    return {
      success: true,
      url: urlData.publicUrl,
      error: null,
    };
  } catch (error) {
    console.error('Error in uploadShoppingListFile:', error);
    return {
      success: false,
      url: null,
      error: error.message || 'Unexpected error uploading file.',
    };
  }
}

/**
 * Check if Supabase Storage is available
 * @returns {boolean}
 */
export function isStorageAvailable() {
  return isSupabaseConfigured();
}

