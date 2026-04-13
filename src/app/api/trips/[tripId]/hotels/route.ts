import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;

  const { data, error } = await getSupabase()
    .from('hotels')
    .select('*')
    .eq('trip_id', tripId)
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;
  const body = await req.json();

  const { data, error } = await getSupabase()
    .from('hotels')
    .insert({
      trip_id: tripId,
      clerk_user_id: userId,
      name: body.name,
      address: body.address || null,
      check_in: body.check_in || null,
      check_out: body.check_out || null,
      price_per_night: body.price_per_night || null,
      total_price: body.total_price || null,
      currency: body.currency || 'USD',
      rooms: body.rooms || 1,
      rating: body.rating || null,
      image_url: body.image_url || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
