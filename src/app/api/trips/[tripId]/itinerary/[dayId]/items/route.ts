import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId, dayId } = await params;
  const body = await req.json();
  const supabase = getSupabase();

  // Get next sort order
  const { data: existing } = await supabase
    .from('itinerary_items')
    .select('sort_order')
    .eq('day_id', dayId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { data, error } = await supabase
    .from('itinerary_items')
    .insert({
      day_id: dayId,
      trip_id: tripId,
      sort_order: nextOrder,
      title: body.title,
      category: body.category || 'activity',
      start_time: body.start_time || null,
      end_time: body.end_time || null,
      estimated_cost: body.estimated_cost || 0,
      currency: body.currency || 'USD',
      notes: body.notes || null,
      place_id: body.place_id || null,
      place_data: body.place_data || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
