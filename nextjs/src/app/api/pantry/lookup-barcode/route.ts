import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getUserTier } from '@/lib/stripe/subscription';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/client-config';
import { lookupBarcode } from '@/lib/open-food-facts';
import { BarcodeLookupResponse } from '@/types/barcode';
import { rateLimit } from '@/lib/rate-limit-redis';
import { assertValidOrigin } from '@/lib/security/csrf';

export async function POST(request: NextRequest) {
  // SECURITY: Validate request origin to prevent CSRF attacks
  const csrfError = assertValidOrigin(request);
  if (csrfError) return csrfError;

  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 60 barcode lookups per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `pantry-barcode-${user.id}`,
      limit: 60,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Try again later.' },
        { status: 429 }
      );
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

    // Check subscription access and limits
    const tier = await getUserTier(user.id);
    if (tier === 'free') {
      return NextResponse.json({
        error: 'Barcode scanning is available for Pro and Premium tiers only'
      }, { status: 403 });
    }

    const limits = SUBSCRIPTION_TIERS[tier].limits;

    // Check scan quota for Pro tier (Premium has unlimited)
    // Barcode scans share the same quota as photo scans
    if (tier === 'pro') {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('pantry_scans_used, pantry_scans_reset_at')
        .eq('user_id', user.id)
        .single();

      if (settings) {
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

    // Get barcode from request body
    const body = await request.json();
    const { barcode } = body;

    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json({
        error: 'Barcode is required'
      }, { status: 400 });
    }

    // Look up the barcode in Open Food Facts
    const result = await lookupBarcode(barcode);

    // Update quota for Pro tier (only if the lookup was successful or not found)
    // We count every lookup attempt, not just successful ones
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

    // Calculate remaining scans for response
    let remainingScans: number | 'unlimited' = 'unlimited';
    if (tier === 'pro') {
      const { data: updatedSettings } = await supabase
        .from('user_settings')
        .select('pantry_scans_used')
        .eq('user_id', user.id)
        .single();

      remainingScans = Math.max(0, limits.pantryScans - (updatedSettings?.pantry_scans_used || 0));
    }

    const response: BarcodeLookupResponse & { remaining_scans: number | 'unlimited' } = {
      ...result,
      remaining_scans: remainingScans
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Barcode lookup error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}
