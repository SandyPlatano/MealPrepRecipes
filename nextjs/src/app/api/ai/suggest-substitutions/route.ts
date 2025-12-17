import { NextResponse } from 'next/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import { getUserTier } from '@/lib/stripe/subscription';
import {
  buildSubstitutionPrompt,
  parseSubstitutionResponse,
  filterAllergenSuggestions,
  detectIngredientRole,
} from '@/lib/ai/substitution-prompt';
import { rateLimit } from '@/lib/rate-limit';
import type { SubstitutionRequest, SubstitutionResponse, SubstitutionError, SubstitutionContext } from '@/types/substitution';
import { SUBSTITUTION_QUOTA_BY_TIER } from '@/types/substitution';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(req: Request) {
  try {
    // Auth check
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return NextResponse.json<SubstitutionError>(
        { type: 'unauthorized', message: 'Please log in to use AI substitutions' },
        { status: 401 }
      );
    }

    // Rate limiting (30 requests/hour - higher than meal suggestions since these are smaller)
    const rateLimitResult = rateLimit({
      identifier: `ai-substitute:${user.id}`,
      limit: 30,
      windowMs: 3600 * 1000, // 1 hour
    });
    if (!rateLimitResult.success) {
      return NextResponse.json<SubstitutionError>(
        {
          type: 'rate_limited',
          message: 'Too many requests. Please wait a moment.',
          retry_after: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { status: 429 }
      );
    }

    // Check subscription tier and quota
    const tier = await getUserTier(user.id);
    const tierLimit = SUBSTITUTION_QUOTA_BY_TIER[tier];

    if (tierLimit === 0) {
      return NextResponse.json<SubstitutionError>(
        {
          type: 'quota_exceeded',
          message: 'AI substitutions require a Pro or Premium subscription',
        },
        { status: 403 }
      );
    }

    // For Pro tier, check weekly quota
    if (tier === 'pro') {
      const quotaInfo = await checkSubstitutionQuota(user.id);
      if (!quotaInfo.can_use) {
        return NextResponse.json<SubstitutionError>(
          {
            type: 'quota_exceeded',
            message: 'Weekly substitution limit reached. Upgrade to Premium or wait until Monday.',
            reset_at: quotaInfo.reset_at || undefined,
          },
          { status: 429 }
        );
      }
    }

    // Parse request
    const body: SubstitutionRequest = await req.json();
    const { ingredient, quantity, unit, recipe_id, recipe_title, reason } = body;

    if (!ingredient || !reason) {
      return NextResponse.json(
        { error: 'ingredient and reason are required' },
        { status: 400 }
      );
    }

    // Gather context
    const context = await gatherSubstitutionContext(
      user.id,
      household.household_id,
      ingredient,
      quantity,
      unit,
      recipe_title,
      reason
    );

    // Build prompt
    const prompt = buildSubstitutionPrompt(context);

    // Call Claude API
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 1500, // Substitutions are smaller than meal plans
        temperature: 0.5, // Lower temp for more consistent results
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      return NextResponse.json<SubstitutionError>(
        { type: 'ai_error', message: 'Unable to generate suggestions. Please try again.' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Parse suggestions
    let suggestions = parseSubstitutionResponse(aiResponse);

    // Safety check: filter out any allergens that slipped through
    suggestions = filterAllergenSuggestions(suggestions, context.allergens);

    if (suggestions.length === 0) {
      return NextResponse.json<SubstitutionError>(
        { type: 'no_substitutes', message: 'No suitable substitutes found for your dietary needs.' },
        { status: 404 }
      );
    }

    // Decrement quota (only for Pro tier)
    if (tier === 'pro') {
      await useSubstitutionQuota(user.id);
    }

    // Log substitution request (but not the chosen one yet - that happens when user accepts)
    const supabase = await createClient();
    // We'll log the actual selection later via a separate endpoint

    // Get remaining quota
    const quotaInfo = tier === 'premium'
      ? { remaining: null }
      : await checkSubstitutionQuota(user.id);

    const responseBody: SubstitutionResponse = {
      suggestions,
      original_ingredient: ingredient,
      context: {
        recipe_title: recipe_title || undefined,
        allergens_avoided: context.allergens,
        dietary_restrictions_honored: context.dietary_restrictions,
      },
      quota_remaining: tier === 'premium' ? null : quotaInfo.remaining ?? 0,
    };

    return NextResponse.json(responseBody);
  } catch (error) {
    console.error('Error generating substitution suggestions:', error);
    return NextResponse.json<SubstitutionError>(
      { type: 'ai_error', message: error instanceof Error ? error.message : 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Gather all context needed for substitution suggestions
 */
async function gatherSubstitutionContext(
  userId: string,
  householdId: string,
  ingredient: string,
  quantity: string | null | undefined,
  unit: string | null | undefined,
  recipeTitle: string | null | undefined,
  reason: SubstitutionRequest['reason']
): Promise<SubstitutionContext> {
  const supabase = await createClient();

  // Get user settings (allergens, dietary restrictions, dislikes)
  const { data: settings } = await supabase
    .from('user_settings')
    .select('allergen_alerts, custom_dietary_restrictions, disliked_ingredients')
    .eq('user_id', userId)
    .single();

  // Get pantry items for the household
  const { data: pantryItems } = await supabase
    .from('pantry_items')
    .select('ingredient')
    .eq('household_id', householdId);

  // Detect ingredient role in recipe
  const role = detectIngredientRole(ingredient, recipeTitle || undefined);

  return {
    original_ingredient: ingredient,
    quantity: quantity || null,
    unit: unit || null,
    recipe_title: recipeTitle || null,
    recipe_role: role,
    dietary_restrictions: settings?.custom_dietary_restrictions || [],
    allergens: settings?.allergen_alerts || [],
    dislikes: settings?.disliked_ingredients || [],
    pantry_items: pantryItems?.map((p) => p.ingredient) || [],
    reason,
  };
}

/**
 * Check substitution quota for a user
 */
async function checkSubstitutionQuota(
  userId: string
): Promise<{ can_use: boolean; remaining: number; reset_at: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_substitution_quota', {
    p_user_id: userId,
  });

  if (error || !data || data.length === 0) {
    console.error('Error checking substitution quota:', error);
    // Default to allowing use if we can't check
    return { can_use: true, remaining: 20, reset_at: null };
  }

  const result = data[0];
  return {
    can_use: result.can_use,
    remaining: result.remaining,
    reset_at: result.reset_at,
  };
}

/**
 * Use one substitution from the user's quota
 */
async function useSubstitutionQuota(userId: string): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('use_substitution_quota', {
    p_user_id: userId,
  });

  if (error) {
    console.error('Error using substitution quota:', error);
    return false;
  }

  return data === true;
}
