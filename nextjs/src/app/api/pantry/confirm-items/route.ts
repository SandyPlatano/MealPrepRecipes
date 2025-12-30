import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/rate-limit-redis';
import { assertValidOrigin } from '@/lib/security/csrf';

interface ConfirmedItem {
  ingredient: string;
  quantity?: string;
  category: string;
  unit?: string;
  notes?: string;
}

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

    // Rate limiting: 60 confirmations per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `pantry-confirm-${user.id}`,
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
    const { data: member } = await supabase
      .from('household_members')
      .select('household_id')
      .eq('user_id', user.id)
      .single();

    if (!member) {
      return NextResponse.json({ error: 'No household found' }, { status: 400 });
    }

    const body = await request.json();
    const { scan_id, confirmed_items, add_to_pantry = true } = body;

    if (!scan_id) {
      return NextResponse.json({ error: 'Scan ID is required' }, { status: 400 });
    }

    if (!confirmed_items || !Array.isArray(confirmed_items)) {
      return NextResponse.json({ error: 'Confirmed items must be an array' }, { status: 400 });
    }

    // Verify the scan belongs to the user's household
    const { data: scan, error: scanError } = await supabase
      .from('pantry_scans')
      .select('id, household_id, scan_type, image_url, detected_items, confirmed_items, processing_status, created_at, updated_at')
      .eq('id', scan_id)
      .eq('household_id', member.household_id)
      .single();

    if (scanError || !scan) {
      return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // Update scan with confirmed items
    const { error: updateError } = await supabase
      .from('pantry_scans')
      .update({
        confirmed_items: confirmed_items,
        processing_status: 'completed'
      })
      .eq('id', scan_id);

    if (updateError) {
      console.error('Error updating scan:', updateError);
      return NextResponse.json({ error: 'Failed to update scan' }, { status: 500 });
    }

    // Add confirmed items to pantry if requested
    if (add_to_pantry && confirmed_items.length > 0) {
      // Prepare items for insertion
      const pantryItems = confirmed_items.map((item: ConfirmedItem) => ({
        household_id: member.household_id,
        ingredient_name: item.ingredient,
        quantity: parseFloat(item.quantity?.replace(/[^\d.]/g, '') || '1'),
        unit: item.unit || item.quantity?.replace(/[\d.]/g, '').trim() || 'unit',
        category: item.category,
        notes: item.notes || `Added from ${scan.scan_type} scan`,
        source: 'scan',
        added_by: user.id
      }));

      // Check for existing items and update or insert
      for (const item of pantryItems) {
        // Check if item already exists
        const { data: existing } = await supabase
          .from('pantry_items')
          .select('id, quantity')
          .eq('household_id', member.household_id)
          .eq('ingredient_name', item.ingredient_name)
          .single();

        if (existing) {
          // Update quantity of existing item
          await supabase
            .from('pantry_items')
            .update({
              quantity: existing.quantity + item.quantity,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id);
        } else {
          // Insert new item
          await supabase
            .from('pantry_items')
            .insert(item);
        }
      }
    }

    // Get updated pantry count
    const { count: pantryCount } = await supabase
      .from('pantry_items')
      .select('*', { count: 'exact', head: true })
      .eq('household_id', member.household_id);

    return NextResponse.json({
      success: true,
      message: `Successfully confirmed ${confirmed_items.length} items`,
      pantry_count: pantryCount || 0,
      added_to_pantry: add_to_pantry
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({
      error: 'An unexpected error occurred'
    }, { status: 500 });
  }
}