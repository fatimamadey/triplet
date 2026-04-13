import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

// GET: List user's favorited trips
export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const supabase = getSupabase();

  const { data: favorites, error } = await supabase
    .from('favorites')
    .select('*, trips(*)')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten: return trip data with favorite info
  const result = (favorites || []).map((f) => ({
    id: f.id,
    trip_id: f.trip_id,
    created_at: f.created_at,
    trip: f.trips,
  }));

  return NextResponse.json(result);
}

// POST: Add a favorite
export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await req.json();

  if (!tripId) {
    return NextResponse.json({ error: 'tripId required' }, { status: 400 });
  }

  const { data, error } = await getSupabase()
    .from('favorites')
    .insert({ clerk_user_id: userId, trip_id: tripId })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Already favorited' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// DELETE: Remove a favorite
export async function DELETE(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: 'tripId required' }, { status: 400 });
  }

  const { error } = await getSupabase()
    .from('favorites')
    .delete()
    .eq('clerk_user_id', userId)
    .eq('trip_id', tripId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
