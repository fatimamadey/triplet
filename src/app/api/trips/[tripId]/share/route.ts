import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';
import crypto from 'crypto';

// POST: Generate share token for a trip
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;
  const supabase = getSupabase();

  // Check if token already exists
  const { data: trip } = await supabase
    .from('trips')
    .select('share_token')
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .single();

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  let shareToken = trip.share_token;

  if (!shareToken) {
    shareToken = crypto.randomBytes(16).toString('base64url');

    const { error } = await supabase
      .from('trips')
      .update({ share_token: shareToken })
      .eq('id', tripId)
      .eq('clerk_user_id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ shareToken });
}

// GET: Fetch trip by share token (public — no auth required)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Fetch trip by share token
  const { data: trip } = await supabase
    .from('trips')
    .select('id, title, destination, country, country_code, currency, image_url, start_date, end_date, num_travelers, status, created_at')
    .eq('share_token', token)
    .single();

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  // Fetch related data
  const [flightsRes, hotelsRes, daysRes] = await Promise.all([
    supabase.from('flights').select('airline, flight_number, origin, destination, departure_at, arrival_at, price, currency').eq('trip_id', trip.id),
    supabase.from('hotels').select('name, address, check_in, check_out, price_per_night, total_price, currency, rating, image_url').eq('trip_id', trip.id),
    supabase.from('itinerary_days').select('*').eq('trip_id', trip.id).order('day_number', { ascending: true }),
  ]);

  // Fetch itinerary items
  const dayIds = (daysRes.data || []).map((d) => d.id);
  let items: Record<string, unknown>[] = [];
  if (dayIds.length > 0) {
    const { data } = await supabase
      .from('itinerary_items')
      .select('*')
      .in('day_id', dayIds)
      .order('sort_order', { ascending: true });
    items = data || [];
  }

  const daysWithItems = (daysRes.data || []).map((day) => ({
    ...day,
    items: items.filter((i) => i.day_id === day.id),
  }));

  // Calculate costs
  const flightsTotal = (flightsRes.data || []).reduce((s, f) => s + (Number(f.price) || 0), 0);
  const hotelsTotal = (hotelsRes.data || []).reduce((s, h) => s + (Number(h.total_price) || 0), 0);
  const activitiesTotal = items.reduce((s, i) => s + (Number((i as { estimated_cost?: number }).estimated_cost) || 0), 0);
  const grandTotal = flightsTotal + hotelsTotal + activitiesTotal;

  return NextResponse.json({
    trip,
    flights: flightsRes.data || [],
    hotels: hotelsRes.data || [],
    itinerary: daysWithItems,
    costs: {
      flights: flightsTotal,
      hotels: hotelsTotal,
      activities: activitiesTotal,
      grandTotal,
      perPerson: trip.num_travelers > 0 ? grandTotal / trip.num_travelers : grandTotal,
    },
  });
}
