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
    .from('flights')
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
    .from('flights')
    .insert({
      trip_id: tripId,
      clerk_user_id: userId,
      airline: body.airline || null,
      flight_number: body.flight_number || null,
      origin: body.origin,
      destination: body.destination,
      departure_at: body.departure_at || null,
      arrival_at: body.arrival_at || null,
      price: body.price || null,
      currency: body.currency || 'USD',
      passengers: body.passengers || 1,
      booking_url: body.booking_url || null,
      amadeus_offer_id: body.amadeus_offer_id || null,
      raw_data: body.raw_data || null,
      transport_type: body.transport_type || 'flight',
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
