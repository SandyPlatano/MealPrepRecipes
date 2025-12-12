import { NextResponse } from 'next/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import { checkAISuggestionQuota, decrementAISuggestionQuota, getUserTier } from '@/lib/stripe/subscription';
import { buildMealSuggestionPrompt, parseAISuggestionResponse } from '@/lib/ai/meal-suggestion-prompt';
import { rateLimit } from '@/lib/rate-limit';
import type { AISuggestionRequest, AISuggestionContext } from '@/types/ai-suggestion';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

export async function POST(req: Request) {
  try {
    // Auth check
    const { user, household } = await getCachedUserWithHousehold();

    if (!user || !household) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (10 requests/hour)
    const rateLimitResult = await rateLimit(`ai-suggest:${user.id}`, 10, 3600);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check subscription tier and quota
    const { remaining, tier } = await checkAISuggestionQuota(user.id);

    if (tier === 'free') {
      return NextResponse.json(
        { error: 'AI suggestions require a Pro or Premium subscription' },
        { status: 403 }
      );
    }

    if (tier === 'pro' && remaining !== null && remaining <= 0) {
      return NextResponse.json(
        { error: 'Weekly quota exhausted. Resets on Monday or upgrade to Premium for unlimited.' },
        { status: 429 }
      );
    }

    // Parse request
    const body: AISuggestionRequest = await req.json();
    const { week_start, locked_days = [], preferences = {} } = body;

    if (!week_start) {
      return NextResponse.json({ error: 'week_start is required' }, { status: 400 });
    }

    // Gather context
    const context = await gatherSuggestionContext(user.id, household.household_id, locked_days);

    // Determine mode: library_only if user has many recipes, mixed otherwise
    const mode = context.user_recipes.length >= 15 ? 'library_only' : 'mixed';

    // Build prompt
    const prompt = buildMealSuggestionPrompt(context, mode);

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
        max_tokens: 4000,
        temperature: 0.7,
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
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const aiResponse = data.content[0].text;

    // Parse suggestions
    const suggestions = parseAISuggestionResponse(aiResponse);

    // Decrement quota (only for Pro tier, Premium is unlimited)
    if (tier === 'pro') {
      await decrementAISuggestionQuota(user.id);
    }

    // Log suggestion
    const supabase = await createClient();
    const { data: existingLogs } = await supabase
      .from('ai_suggestion_logs')
      .select('regeneration_number')
      .eq('household_id', household.household_id)
      .eq('week_start', week_start)
      .order('regeneration_number', { ascending: false })
      .limit(1);

    const regenerationNumber = existingLogs && existingLogs.length > 0
      ? existingLogs[0].regeneration_number + 1
      : 1;

    await supabase.from('ai_suggestion_logs').insert({
      household_id: household.household_id,
      week_start,
      suggestions,
      accepted_count: 0,
      regeneration_number: regenerationNumber,
    });

    // Get updated quota
    const updatedQuota = await checkAISuggestionQuota(user.id);

    return NextResponse.json({
      suggestions,
      remaining_regenerations: updatedQuota.remaining,
      week_start,
    });
  } catch (error) {
    console.error('Error generating meal suggestions:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}

/**
 * Gather all context needed for AI suggestions
 */
async function gatherSuggestionContext(
  userId: string,
  householdId: string,
  lockedDays: string[]
): Promise<AISuggestionContext> {
  const supabase = await createClient();

  // Get user's recipes
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, cuisine, protein_type, prep_time, cook_time, rating, servings, base_servings, tags')
    .eq('household_id', householdId)
    .order('created_at', { ascending: false })
    .limit(100);

  // Get recent cooking history (last 14 days)
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const { data: history } = await supabase
    .from('cooking_history')
    .select('recipe_id, cooked_at, rating, recipes(id, title)')
    .eq('household_id', householdId)
    .gte('cooked_at', fourteenDaysAgo.toISOString())
    .order('cooked_at', { ascending: false });

  // Get favorites
  const { data: favoritesData } = await supabase
    .from('favorites')
    .select('recipe_id, recipes(title)')
    .eq('user_id', userId);

  // Get user settings (allergens, dietary restrictions, household size)
  const { data: settings } = await supabase
    .from('user_settings')
    .select('allergen_alerts, custom_dietary_restrictions')
    .eq('user_id', userId)
    .single();

  // Get household size
  const { data: householdMembers } = await supabase
    .from('household_members')
    .select('user_id')
    .eq('household_id', householdId);

  return {
    user_recipes: recipes?.map((r) => ({
      id: r.id,
      title: r.title,
      cuisine: r.cuisine || 'Other',
      protein_type: r.protein_type || 'Other',
      prep_time: r.prep_time || 30,
      cook_time: r.cook_time || 30,
      rating: r.rating,
      servings: r.servings || 4,
      base_servings: r.base_servings || 4,
      tags: r.tags || [],
    })) || [],
    recent_history: history?.map((h) => ({
      recipe_id: h.recipe_id,
      recipe_title: (h.recipes as any)?.title || 'Unknown',
      cooked_at: h.cooked_at,
      rating: h.rating,
    })) || [],
    favorites: favoritesData?.map((f) => (f.recipes as any)?.title).filter(Boolean) || [],
    allergen_alerts: settings?.allergen_alerts || [],
    dietary_restrictions: settings?.custom_dietary_restrictions || [],
    household_size: householdMembers?.length || 1,
    locked_days: lockedDays,
  };
}
