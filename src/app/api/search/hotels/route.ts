import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';
import { searchHotels } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults');
  const type = searchParams.get('type'); // 'hotels' or 'rentals'

  if (!query || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: 'query, checkIn, and checkOut are required' },
      { status: 400 }
    );
  }

  if (!process.env.SERPAPI_API_KEY) {
    return NextResponse.json(
      { error: 'Hotel search not configured. Add SERPAPI_API_KEY to .env.local' },
      { status: 503 }
    );
  }

  try {
    const data = await searchHotels({
      query,
      checkIn,
      checkOut,
      adults: adults ? parseInt(adults) : undefined,
      vacationRentals: type === 'rentals',
    });

    const properties = (data.properties || []).slice(0, 12).map((p, i) => ({
      id: `hotel-${i}`,
      name: p.name,
      type: p.type || 'hotel',
      link: p.link,
      pricePerNight: p.rate_per_night?.extracted_lowest || null,
      totalPrice: p.total_rate?.extracted_lowest || null,
      priceDisplay: p.rate_per_night?.lowest || null,
      rating: p.overall_rating || null,
      reviews: p.reviews || 0,
      hotelClass: p.extracted_hotel_class || null,
      hotelClassLabel: p.hotel_class || null,
      image: p.images?.[0]?.thumbnail || p.images?.[0]?.original_image || null,
      amenities: p.amenities || [],
      coordinates: p.gps_coordinates || null,
    }));

    return NextResponse.json(properties);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Hotel search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
