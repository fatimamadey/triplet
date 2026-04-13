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
  const supabase = getSupabase();

  // Verify ownership
  const { data: trip, error: tripError } = await supabase
    .from('trips')
    .select('num_travelers')
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  // Aggregate costs from all three tables
  const [flightsResult, hotelsResult, itemsResult] = await Promise.all([
    supabase
      .from('flights')
      .select('price')
      .eq('trip_id', tripId),
    supabase
      .from('hotels')
      .select('total_price')
      .eq('trip_id', tripId),
    supabase
      .from('itinerary_items')
      .select('estimated_cost')
      .eq('trip_id', tripId),
  ]);

  const flightsTotal = (flightsResult.data || []).reduce(
    (sum, f) => sum + (Number(f.price) || 0),
    0
  );
  const hotelsTotal = (hotelsResult.data || []).reduce(
    (sum, h) => sum + (Number(h.total_price) || 0),
    0
  );
  const activitiesTotal = (itemsResult.data || []).reduce(
    (sum, i) => sum + (Number(i.estimated_cost) || 0),
    0
  );

  const grandTotal = flightsTotal + hotelsTotal + activitiesTotal;
  const numTravelers = trip.num_travelers || 1;

  return NextResponse.json({
    flights: {
      total: flightsTotal,
      currency: 'USD',
      count: flightsResult.data?.length || 0,
    },
    hotels: {
      total: hotelsTotal,
      currency: 'USD',
      count: hotelsResult.data?.length || 0,
    },
    activities: {
      total: activitiesTotal,
      currency: 'USD',
      count: itemsResult.data?.length || 0,
    },
    grandTotal,
    perPerson: numTravelers > 0 ? grandTotal / numTravelers : grandTotal,
    numTravelers,
  });
}
