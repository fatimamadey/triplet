import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

// GET all days + items for a trip
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: trip } = await supabase
    .from('trips')
    .select('id')
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .single();

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  const { data: days, error } = await supabase
    .from('itinerary_days')
    .select('*')
    .eq('trip_id', tripId)
    .order('day_number', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch items for all days
  const dayIds = (days || []).map((d) => d.id);
  let items: Record<string, unknown>[] = [];

  if (dayIds.length > 0) {
    const { data: itemsData } = await supabase
      .from('itinerary_items')
      .select('*')
      .in('day_id', dayIds)
      .order('start_time', { ascending: true, nullsFirst: false })
      .order('sort_order', { ascending: true });

    items = itemsData || [];
  }

  // Group items by day
  const daysWithItems = (days || []).map((day) => ({
    ...day,
    items: items.filter((item) => item.day_id === day.id),
  }));

  return NextResponse.json(daysWithItems);
}

// POST: create a new day (or auto-generate all days)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;
  const body = await req.json();
  const supabase = getSupabase();

  // Verify ownership and get trip dates
  const { data: trip } = await supabase
    .from('trips')
    .select('id, start_date, end_date')
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .single();

  if (!trip) {
    return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
  }

  // If action is "generate", auto-create all days from trip date range
  if (body.action === 'generate') {
    if (!trip.start_date || !trip.end_date) {
      return NextResponse.json(
        { error: 'Trip must have start and end dates to auto-generate days' },
        { status: 400 }
      );
    }

    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Delete existing days first
    await supabase.from('itinerary_days').delete().eq('trip_id', tripId);

    const daysToInsert = Array.from({ length: dayCount }, (_, i) => {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      return {
        trip_id: tripId,
        day_number: i + 1,
        date: date.toISOString().split('T')[0],
      };
    });

    const { data, error } = await supabase
      .from('itinerary_days')
      .insert(daysToInsert)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  }

  // Otherwise, add a single day
  const { data, error } = await supabase
    .from('itinerary_days')
    .insert({
      trip_id: tripId,
      day_number: body.day_number,
      date: body.date || null,
      notes: body.notes || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
