import { NextResponse } from 'next/server';
import { getCachedUserWithHousehold } from '@/lib/supabase/cached-queries';
import { createClient } from '@/lib/supabase/server';
import { getUserTier } from '@/lib/stripe/subscription';
import { buildQuickCookPrompt, parseQuickCookResponse } from '@/lib/ai/quick-cook-prompt';
import { rateLimit } from '@/lib/rate-limit';
import type { QuickCookRequest, QuickCookResponse, QUICK_COOK_QUOTA } from '@/types/quick-cook';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Quick Cook daily quota configuration by tier
 */
const DAILY_QUOTA: Record<'free' | 'pro' | 'premium', number | null> = {
  free: 5,
  pro: 20,
  premium: null, // unlimited
};

export async function POST(req: Request) {
  try {
    // Auth check
    const { user, household, householdId } = await getCachedUserWithHousehold();

    if (!user || !household || !householdId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting (20 requests/hour hard limit)
    const rateLimitResult = rateLimit({
      identifier: `quick-cook:${user.id}`,
      limit: 20,
      windowMs: 3600 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Check subscription tier and daily quota
    const tier = await getUserTier(user.id);
    const dailyLimit = DAILY_QUOTA[tier];

    // Get today's usage
    const supabase = await createClient();
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const { count: usesToday } = await supabase
      .from('quick_cook_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', todayStart.toISOString());

    const currentUses = usesToday || 0;

    // Check if quota exceeded (null = unlimited)
    if (dailyLimit !== null && currentUses >= dailyLimit) {
      return NextResponse.json(
        {
          error: `Daily limit reached (${dailyLimit} uses). ${tier === 'free' ? 'Upgrade to Pro for more!' : 'Resets at midnight UTC.'}`,
          remaining_uses: 0,
          uses_today: currentUses,
        },
        { status: 429 }
      );
    }

    // Parse request
    const body: QuickCookRequest = await req.json();
    const { timeAvailable, energyLevel, ingredientsOnHand, servings } = body;

    // Validate required fields
    if (!timeAvailable || !energyLevel) {
      return NextResponse.json(
        { error: 'timeAvailable and energyLevel are required' },
        { status: 400 }
      );
    }

    // Gather context for AI
    const context = await gatherQuickCookContext(
      user.id,
      householdId,
      body
    );

    // Build prompt
    const prompt = buildQuickCookPrompt(context);

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
        max_tokens: 1500,
        temperature: 0.8, // Slightly higher for variety
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

    // Parse suggestion
    const suggestion = parseQuickCookResponse(aiResponse);

    // Log the suggestion
    await supabase.from('quick_cook_logs').insert({
      user_id: user.id,
      household_id: householdId,
      request: body,
      suggestion,
      accepted: null,
      regeneration_count: 0,
      affiliate_clicked: false,
    });

    // Calculate remaining uses
    const newUsesToday = currentUses + 1;
    const remainingUses = dailyLimit === null ? null : dailyLimit - newUsesToday;

    const result: QuickCookResponse = {
      suggestion,
      remaining_uses: remainingUses,
      uses_today: newUsesToday,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating quick cook suggestion:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}

/**
 * Gather context for quick cook AI prompt
 */
async function gatherQuickCookContext(
  userId: string,
  householdId: string,
  request: QuickCookRequest
) {
  const supabase = await createClient();

  // Get user's recipes (filtered by time constraint)
  const maxTime = request.timeAvailable + 15; // Allow 15 min buffer
  const { data: recipes } = await supabase
    .from('recipes')
    .select('id, title, cuisine, protein_type, prep_time, cook_time, rating, tags')
    .eq('household_id', householdId)
    .order('rating', { ascending: false, nullsFirst: false })
    .limit(50);

  // Filter by time
  const eligibleRecipes = (recipes || []).filter((r) => {
    const totalTime = (r.prep_time || 30) + (r.cook_time || 0);
    return totalTime <= maxTime;
  });

  // Get recent cooking history (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: history } = await supabase
    .from('cooking_history')
    .select('recipe_id, cooked_at, recipes(title)')
    .eq('household_id', householdId)
    .gte('cooked_at', sevenDaysAgo.toISOString())
    .order('cooked_at', { ascending: false })
    .limit(10);

  // Get favorites
  const { data: favoritesData } = await supabase
    .from('favorites')
    .select('recipe_id, recipes(title)')
    .eq('user_id', userId)
    .limit(10);

  // Get user settings
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
    request,
    userRecipes: eligibleRecipes.map((r) => ({
      id: r.id,
      title: r.title,
      cuisine: r.cuisine || 'Other',
      protein_type: r.protein_type || 'Other',
      prep_time: r.prep_time || 30,
      cook_time: r.cook_time || 0,
      rating: r.rating,
      tags: r.tags || [],
    })),
    recentHistory: (history || []).map((h) => ({
      recipe_title: (h.recipes as { title?: string })?.title || 'Unknown',
      cooked_at: h.cooked_at,
    })),
    favorites: (favoritesData || [])
      .map((f) => (f.recipes as { title?: string })?.title)
      .filter((t): t is string => !!t),
    allergenAlerts: settings?.allergen_alerts || [],
    dietaryRestrictions: settings?.custom_dietary_restrictions || [],
    householdSize: householdMembers?.length || 1,
  };
}
