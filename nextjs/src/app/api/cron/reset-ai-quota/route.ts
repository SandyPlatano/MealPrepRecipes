import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * Cron job to reset AI suggestion quotas every Monday
 * Configure in vercel.json with schedule: "0 0 * * 1"
 */
export async function GET(req: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClient();

    // Calculate next Monday
    const nextMonday = getNextMonday(new Date());

    // Reset Pro users to 5 regenerations
    const { data: proSubscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('tier', 'pro')
      .in('status', ['active', 'trialing']);

    if (proSubscriptions && proSubscriptions.length > 0) {
      const proUserIds = proSubscriptions.map((s) => s.user_id);

      const { error: updateError } = await supabase
        .from('user_settings')
        .update({
          ai_suggestions_remaining: 5,
          ai_suggestions_reset_at: nextMonday.toISOString(),
        })
        .in('user_id', proUserIds);

      if (updateError) {
        console.error('Error resetting Pro user quotas:', updateError);
      } else {
        console.log(`Reset quota for ${proUserIds.length} Pro users`);
      }
    }

    // Premium users don't need reset (unlimited)
    // But we can update their reset_at for consistency
    const { data: premiumSubscriptions } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('tier', 'premium')
      .in('status', ['active', 'trialing']);

    if (premiumSubscriptions && premiumSubscriptions.length > 0) {
      const premiumUserIds = premiumSubscriptions.map((s) => s.user_id);

      await supabase
        .from('user_settings')
        .update({
          ai_suggestions_reset_at: nextMonday.toISOString(),
        })
        .in('user_id', premiumUserIds);

      console.log(`Updated reset_at for ${premiumUserIds.length} Premium users`);
    }

    return NextResponse.json({
      success: true,
      reset_date: nextMonday.toISOString(),
      pro_users_reset: proSubscriptions?.length || 0,
      premium_users_updated: premiumSubscriptions?.length || 0,
    });
  } catch (error) {
    console.error('Error in quota reset cron:', error);
    return NextResponse.json(
      { error: 'Failed to reset quotas' },
      { status: 500 }
    );
  }
}

/**
 * Helper to get next Monday at 00:00 UTC
 */
function getNextMonday(date: Date): Date {
  const nextMonday = new Date(date);
  const dayOfWeek = nextMonday.getUTCDay();
  const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
  nextMonday.setUTCDate(nextMonday.getUTCDate() + daysUntilMonday);
  nextMonday.setUTCHours(0, 0, 0, 0);
  return nextMonday;
}
