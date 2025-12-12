'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface PantryScan {
  id: string;
  household_id: string;
  user_id: string;
  image_url: string;
  scan_type: 'fridge' | 'pantry' | 'other';
  detected_items: unknown[];
  confirmed_items: unknown[];
  processing_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  created_at: string;
  processed_at: string | null;
}

export interface ScanQuota {
  used: number;
  limit: number | 'unlimited';
  resetDate: Date | null;
}

/**
 * Get the user's pantry scan quota
 */
export async function getPantryScanQuota(): Promise<ScanQuota> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (!profile) {
    throw new Error('Profile not found');
  }

  // Premium users have unlimited scans
  if (profile.subscription_tier === 'premium') {
    return {
      used: 0,
      limit: 'unlimited',
      resetDate: null
    };
  }

  // Free users don't have access
  if (profile.subscription_tier === 'free') {
    return {
      used: 0,
      limit: 0,
      resetDate: null
    };
  }

  // Pro users have 10 scans per month
  const { data: settings } = await supabase
    .from('user_settings')
    .select('pantry_scans_used, pantry_scans_reset_at')
    .eq('user_id', user.id)
    .single();

  if (!settings) {
    // Create default settings if they don't exist
    const resetDate = new Date();
    resetDate.setMonth(resetDate.getMonth() + 1);
    resetDate.setDate(1);
    resetDate.setHours(0, 0, 0, 0);

    await supabase
      .from('user_settings')
      .insert({
        user_id: user.id,
        pantry_scans_used: 0,
        pantry_scans_reset_at: resetDate.toISOString()
      });

    return {
      used: 0,
      limit: 10,
      resetDate: resetDate
    };
  }

  // Check if quota should be reset
  const resetDate = new Date(settings.pantry_scans_reset_at);
  const now = new Date();

  if (now >= resetDate) {
    // Reset the quota
    const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    await supabase
      .from('user_settings')
      .update({
        pantry_scans_used: 0,
        pantry_scans_reset_at: newResetDate.toISOString()
      })
      .eq('user_id', user.id);

    return {
      used: 0,
      limit: 10,
      resetDate: newResetDate
    };
  }

  return {
    used: settings.pantry_scans_used || 0,
    limit: 10,
    resetDate: resetDate
  };
}

/**
 * Get pantry scan history for the user's household
 * Returns empty array if no household found or no scans exist
 */
export async function getPantryScanHistory(limit = 10): Promise<PantryScan[]> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    // Return empty array instead of throwing - component handles empty state
    return [];
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  // If no household found, return empty array (user hasn't set up household yet)
  if (!member) {
    return [];
  }

  const { data: scans, error } = await supabase
    .from('pantry_scans')
    .select('*')
    .eq('household_id', member.household_id)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching scan history:', error);
    // Return empty array instead of throwing - component handles empty state gracefully
    return [];
  }

  return scans || [];
}

/**
 * Get a specific pantry scan by ID
 */
export async function getPantryScan(scanId: string): Promise<PantryScan | null> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    throw new Error('No household found');
  }

  const { data: scan, error } = await supabase
    .from('pantry_scans')
    .select('*')
    .eq('id', scanId)
    .eq('household_id', member.household_id)
    .single();

  if (error) {
    console.error('Error fetching scan:', error);
    return null;
  }

  return scan;
}

/**
 * Delete a pantry scan
 */
export async function deletePantryScan(scanId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Not authenticated' };
  }

  // Get the scan to verify ownership and get image URL
  const { data: scan } = await supabase
    .from('pantry_scans')
    .select('image_url, user_id')
    .eq('id', scanId)
    .single();

  if (!scan) {
    return { success: false, error: 'Scan not found' };
  }

  if (scan.user_id !== user.id) {
    return { success: false, error: 'Unauthorized' };
  }

  // Delete the image from storage if it exists
  if (scan.image_url) {
    try {
      // Extract the file path from the URL
      const urlParts = scan.image_url.split('/');
      const filePath = urlParts.slice(-2).join('/'); // household_id/scan_id.ext

      await supabase.storage
        .from('pantry-scans')
        .remove([filePath]);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Continue even if image deletion fails
    }
  }

  // Delete the scan record
  const { error } = await supabase
    .from('pantry_scans')
    .delete()
    .eq('id', scanId);

  if (error) {
    console.error('Error deleting scan:', error);
    return { success: false, error: 'Failed to delete scan' };
  }

  revalidatePath('/pantry');
  return { success: true };
}

/**
 * Get suggested recipes based on pantry items
 */
export async function getSuggestedRecipesFromPantry(limit = 5) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Get user's household
  const { data: member } = await supabase
    .from('household_members')
    .select('household_id')
    .eq('user_id', user.id)
    .single();

  if (!member) {
    throw new Error('No household found');
  }

  // Get pantry items
  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select('ingredient_name')
    .eq('household_id', member.household_id);

  if (!pantryItems || pantryItems.length === 0) {
    return [];
  }

  const ingredientNames = pantryItems.map(item => item.ingredient_name.toLowerCase());

  // Get all recipes for the household
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, ingredients, prep_time, cook_time, image_url, difficulty')
    .eq('household_id', member.household_id);

  if (!recipes) {
    return [];
  }

  // Calculate match score for each recipe
  const scoredRecipes = recipes
    .map(recipe => {
      const recipeIngredients = recipe.ingredients || [];
      let matchingIngredients = 0;
      const totalIngredients = recipeIngredients.length;

      recipeIngredients.forEach((ing: { name?: string }) => {
        const ingName = (ing.name || '').toLowerCase();
        if (ingredientNames.some(pantryIng =>
          ingName.includes(pantryIng) || pantryIng.includes(ingName)
        )) {
          matchingIngredients++;
        }
      });

      const matchPercentage = totalIngredients > 0
        ? (matchingIngredients / totalIngredients) * 100
        : 0;

      return {
        ...recipe,
        matching_ingredients: matchingIngredients,
        total_ingredients: totalIngredients,
        missing_ingredients: totalIngredients - matchingIngredients,
        match_percentage: Math.round(matchPercentage)
      };
    })
    .filter(recipe => recipe.matching_ingredients > 0)
    .sort((a, b) => b.match_percentage - a.match_percentage)
    .slice(0, limit);

  return scoredRecipes;
}