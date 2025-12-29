import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import Anthropic from '@anthropic-ai/sdk';
import { getUserTier } from '@/lib/stripe/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/client-config';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Magic bytes (file signatures) for allowed image types
 * SECURITY: Validates actual file content, not just declared MIME type
 */
const MAGIC_BYTES: Record<string, { bytes: number[]; offset?: number }[]> = {
  'image/jpeg': [
    { bytes: [0xff, 0xd8, 0xff] }, // JPEG signature (first 3 bytes)
  ],
  'image/png': [
    { bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }, // PNG signature
  ],
  'image/webp': [
    { bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 }, // "RIFF" at start
    // Note: WebP also has "WEBP" at offset 8, but checking RIFF is sufficient
  ],
};

/**
 * Validates that file content matches declared MIME type using magic bytes
 * SECURITY: Prevents MIME type spoofing attacks
 */
function validateMagicBytes(buffer: ArrayBuffer, declaredMimeType: string): boolean {
  const signatures = MAGIC_BYTES[declaredMimeType];
  if (!signatures) {
    return false; // Unknown MIME type
  }

  const uint8Array = new Uint8Array(buffer);

  for (const sig of signatures) {
    const offset = sig.offset ?? 0;
    let matches = true;

    for (let i = 0; i < sig.bytes.length; i++) {
      if (uint8Array[offset + i] !== sig.bytes[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return true;
    }
  }

  return false;
}

interface DetectedItem {
  ingredient: string;
  quantity?: string;
  category: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's household
    const { data: member, error: memberError } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      console.error('Error fetching household member:', memberError);
      return NextResponse.json({ 
        error: 'No household found. Please create or join a household first.' 
      }, { status: 400 });
    }

    // Verify household exists (for foreign key constraint)
    const { data: household, error: householdError } = await supabase
      .from('households')
      .select('id')
      .eq('id', member.household_id)
      .single();

    if (householdError || !household) {
      console.error('Error verifying household:', householdError);
      return NextResponse.json({ 
        error: 'Invalid household reference. Please contact support.' 
      }, { status: 400 });
    }

    // Check subscription access and limits
    const tier = await getUserTier(user.id);
    if (tier === 'free') {
      return NextResponse.json({
        error: 'Pantry scanning is available for Pro and Premium tiers only'
      }, { status: 403 });
    }

    const limits = SUBSCRIPTION_TIERS[tier].limits;

    // Check scan quota for Pro tier (Premium has unlimited)
    if (tier === 'pro') {
      // Get user settings to check quota
      const { data: settings } = await supabase
        .from('user_settings')
        .select('pantry_scans_used, pantry_scans_reset_at')
        .eq('user_id', user.id)
        .single();

      if (settings) {
        // Reset quota if needed
        const resetDate = new Date(settings.pantry_scans_reset_at);
        const now = new Date();

        if (now >= resetDate) {
          // Reset the quota
          await supabase
            .from('user_settings')
            .update({
              pantry_scans_used: 0,
              pantry_scans_reset_at: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
            })
            .eq('user_id', user.id);
        } else if (settings.pantry_scans_used >= limits.pantryScans) {
          return NextResponse.json({
            error: `Monthly scan limit reached (${limits.pantryScans}). Resets on ${resetDate.toLocaleDateString()}`,
            quotaExceeded: true
          }, { status: 429 });
        }
      }
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const scanType = formData.get('scanType') as string || 'fridge';

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate file type (MIME type check)
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.'
      }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.'
      }, { status: 400 });
    }

    // SECURITY: Validate magic bytes to prevent MIME type spoofing
    // This ensures the actual file content matches the declared type
    const arrayBuffer = await file.arrayBuffer();
    if (!validateMagicBytes(arrayBuffer, file.type)) {
      return NextResponse.json({
        error: 'File content does not match declared type. Please upload a valid image.'
      }, { status: 400 });
    }

    // Create a scan record
    // Use a placeholder URL initially since image_url is NOT NULL
    // We'll update it with the actual URL after upload
    const { data: scan, error: scanError } = await supabase
      .from('pantry_scans')
      .insert({
        household_id: member.household_id,
        user_id: user.id,
        scan_type: scanType,
        processing_status: 'processing',
        image_url: 'pending' // Placeholder - will be updated after upload
      })
      .select()
      .single();

    if (scanError) {
      console.error('Error creating scan record:', {
        error: scanError,
        message: scanError.message,
        details: scanError.details,
        hint: scanError.hint,
        code: scanError.code,
        household_id: member.household_id,
        user_id: user.id,
      });
      
      // Provide more specific error message
      let errorMessage = 'Failed to create scan record';
      if (scanError.code === '42501') {
        errorMessage = 'Permission denied. Please ensure you are part of a household.';
      } else if (scanError.code === '23503') {
        errorMessage = 'Invalid household or user reference.';
      } else if (scanError.message) {
        errorMessage = `Failed to create scan record: ${scanError.message}`;
      }
      
      return NextResponse.json({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? scanError : undefined
      }, { status: 500 });
    }

    // Upload image to Supabase Storage
    const fileName = `${member.household_id}/${scan.id}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage
      .from('pantry-scans')
      .upload(fileName, file);

    if (uploadError) {
      // Cast to access potential additional error properties
      const errorObj = uploadError as unknown as { statusCode?: string; error?: string };
      console.error('Error uploading image:', {
        error: uploadError,
        message: uploadError.message,
        statusCode: errorObj.statusCode,
        errorCode: errorObj.error,
      });

      // Provide more specific error messages
      let errorMessage = 'Failed to upload image';
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('does not exist')) {
        errorMessage = 'Storage bucket not configured. Please create the "pantry-scans" bucket in Supabase Dashboard.';
      } else if (uploadError.message?.includes('new row violates row-level security policy') || errorObj.statusCode === '403') {
        errorMessage = 'Permission denied. Storage bucket RLS policies may need to be configured.';
      } else if (uploadError.message) {
        errorMessage = `Failed to upload image: ${uploadError.message}`;
      }

      await supabase
        .from('pantry_scans')
        .update({
          processing_status: 'failed',
          error_message: errorMessage
        })
        .eq('id', scan.id);

      return NextResponse.json({
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? {
          uploadError: uploadError.message,
          statusCode: errorObj.statusCode,
          errorCode: errorObj.error,
        } : undefined
      }, { status: 500 });
    }

    // Get public URL for the image
    const { data: { publicUrl } } = supabase.storage
      .from('pantry-scans')
      .getPublicUrl(fileName);

    // Update scan with image URL
    await supabase
      .from('pantry_scans')
      .update({ image_url: publicUrl })
      .eq('id', scan.id);

    // Convert file to base64 for Claude Vision API
    // Note: arrayBuffer was already read during magic bytes validation above
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Analyze image with Claude Vision
    try {
      const response = await anthropic.messages.create({
        model: 'claude-3-opus-20240229',
        max_tokens: 1024,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
                data: base64
              }
            },
            {
              type: 'text',
              text: `Analyze this ${scanType} image and identify all visible food items and ingredients.

For each item you can clearly identify, provide:
1. ingredient: A normalized, generic name (e.g., "milk" not "Horizon Organic 2% Milk")
2. quantity: Estimated amount if visible (e.g., "1 carton", "half bottle", "3 apples")
3. category: One of: Produce, Dairy, Meat, Seafood, Pantry, Condiments, Beverages, Frozen, Snacks, Other
4. confidence: A score from 0 to 1 indicating how confident you are in the identification

Only include items where you have at least 0.8 confidence.
Focus on identifiable food items and ingredients.
Ignore unclear items, empty containers, or non-food items.

Return the results as a JSON array. Example:
[
  {"ingredient": "milk", "quantity": "1 gallon", "category": "Dairy", "confidence": 0.95},
  {"ingredient": "eggs", "quantity": "1 dozen", "category": "Dairy", "confidence": 0.9},
  {"ingredient": "lettuce", "quantity": "1 head", "category": "Produce", "confidence": 0.85}
]

If no items can be identified with sufficient confidence, return an empty array: []`
            }
          ]
        }]
      });

      // Parse the response
      let detectedItems: DetectedItem[] = [];
      const content = response.content[0];

      if (content.type === 'text') {
        try {
          // Extract JSON from the response
          const jsonMatch = content.text.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            detectedItems = JSON.parse(jsonMatch[0]);
            // Filter to ensure minimum confidence
            detectedItems = detectedItems.filter(item => item.confidence >= 0.8);
          }
        } catch (parseError) {
          console.error('Error parsing Claude response:', parseError);
        }
      }

      // Update scan with detected items
      await supabase
        .from('pantry_scans')
        .update({
          detected_items: detectedItems,
          processing_status: 'completed',
          processed_at: new Date().toISOString()
        })
        .eq('id', scan.id);

      // Update quota for Pro tier
      if (tier === 'pro') {
        const { data: currentSettings } = await supabase
          .from('user_settings')
          .select('pantry_scans_used')
          .eq('user_id', user.id)
          .single();

        await supabase
          .from('user_settings')
          .update({
            pantry_scans_used: (currentSettings?.pantry_scans_used || 0) + 1
          })
          .eq('user_id', user.id);
      }

      // Get recipe suggestions based on detected items
      let suggestedRecipes: Array<{
        id: string;
        title: string;
        prep_time: string | null;
        cook_time: string | null;
        image_url: string | null;
        matching_ingredients: number;
        total_ingredients: number;
        missing_ingredients: number;
      }> = [];
      if (detectedItems.length > 0) {
        const ingredientNames = detectedItems.map(item => item.ingredient);

        // Get recipes that match pantry ingredients
        const { data: recipes } = await supabase
          .from('recipes')
          .select('id, title, ingredients, prep_time, cook_time, image_url')
          .eq('household_id', member.household_id)
          .limit(5);

        if (recipes) {
          // Calculate match score for each recipe
          suggestedRecipes = recipes
            .map(recipe => {
              const recipeIngredients = recipe.ingredients || [];
              const matchingIngredients = recipeIngredients.filter((ing: { name?: string }) =>
                ingredientNames.some(pantryIng => {
                  const ingName = ing.name?.toLowerCase() || '';
                  return ingName.includes(pantryIng.toLowerCase()) ||
                    pantryIng.toLowerCase().includes(ingName);
                })
              );

              return {
                id: recipe.id,
                title: recipe.title,
                prep_time: recipe.prep_time,
                cook_time: recipe.cook_time,
                image_url: recipe.image_url,
                matching_ingredients: matchingIngredients.length,
                total_ingredients: recipeIngredients.length,
                missing_ingredients: recipeIngredients.length - matchingIngredients.length
              };
            })
            .filter(recipe => recipe.matching_ingredients > 0)
            .sort((a, b) => {
              // Sort by percentage of ingredients matched
              const aScore = a.matching_ingredients / a.total_ingredients;
              const bScore = b.matching_ingredients / b.total_ingredients;
              return bScore - aScore;
            })
            .slice(0, 5);
        }
      }

      return NextResponse.json({
        scan_id: scan.id,
        detected_items: detectedItems,
        suggested_recipes: suggestedRecipes,
        remaining_scans: tier === 'pro'
          ? Math.max(0, limits.pantryScans - ((await supabase
              .from('user_settings')
              .select('pantry_scans_used')
              .eq('user_id', user.id)
              .single()).data?.pantry_scans_used || 0))
          : 'unlimited'
      });

    } catch (aiError) {
      console.error('Error analyzing image:', aiError);
      await supabase
        .from('pantry_scans')
        .update({
          processing_status: 'failed',
          error_message: 'Failed to analyze image'
        })
        .eq('id', scan.id);

      return NextResponse.json({
        error: 'Failed to analyze image. Please try again.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}