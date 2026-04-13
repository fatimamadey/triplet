import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string; itemId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId, itemId } = await params;
  const body = await req.json();

  const { data, error } = await getSupabase()
    .from('itinerary_items')
    .update(body)
    .eq('id', itemId)
    .eq('trip_id', tripId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; dayId: string; itemId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId, itemId } = await params;

  const { error } = await getSupabase()
    .from('itinerary_items')
    .delete()
    .eq('id', itemId)
    .eq('trip_id', tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
