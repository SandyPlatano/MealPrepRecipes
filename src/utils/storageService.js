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

    // For HTML files, we need to use a different approach since Supabase Storage
    // serves HTML files as downloads. Create a signed URL with download option disabled.
    let finalUrl = urlData.publicUrl;
    
    if (contentType.includes('text/html')) {
      // Use signed URL for HTML files with proper inline display
      try {
        const { data: signedData, error: signedError } = await supabase.storage
          .from(SHOPPING_LISTS_BUCKET)
          .createSignedUrl(filePath, 60 * 60 * 24 * 7, { // 7 days expiry
            download: false, // Force inline display
          });
        
        if (!signedError && signedData?.signedUrl) {
          finalUrl = signedData.signedUrl;
        }
      } catch (e) {
        console.warn('Failed to create signed URL, using public URL:', e);
      }
    }

    return {
      success: true,
      url: finalUrl,
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

/**
 * Initialize shopping list state in Supabase
 * Called when generating interactive shopping list HTML
 * @param {string} listId - Unique ID for the shopping list
 * @param {Array<{item_id: string, item_text: string, category: string}>} items - List of items to initialize
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export async function initializeShoppingListState(listId, items) {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: 'Supabase is not configured.',
    };
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Failed to initialize Supabase client.',
    };
  }

  try {
    // Insert or update items (upsert)
    const itemsToInsert = items.map(item => ({
      list_id: listId,
      item_id: item.item_id,
      item_text: item.item_text,
      category: item.category || null,
      checked: false,
      added_by_user: false,
    }));

    // Use upsert to handle duplicates
    const { error } = await supabase
      .from('shopping_list_state')
      .upsert(itemsToInsert, {
        onConflict: 'list_id,item_id',
        ignoreDuplicates: false,
      });

    if (error) {
      console.error('Error initializing shopping list state:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize shopping list state.',
      };
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error('Error in initializeShoppingListState:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error initializing shopping list state.',
    };
  }
}

