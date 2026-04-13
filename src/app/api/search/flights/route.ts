import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';
import { amadeusGet } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const adults = searchParams.get('adults') || '1';

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'origin, destination, and departureDate are required' },
      { status: 400 }
    );
  }

  // Check if Amadeus is configured
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    return NextResponse.json(
      { error: 'Flight search API not configured. Add AMADEUS_API_KEY and AMADEUS_API_SECRET to .env.local' },
      { status: 503 }
    );
  }

  try {
    const params: Record<string, string> = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate,
      adults,
      max: '10',
      currencyCode: 'USD',
    };

    if (returnDate) {
      params.returnDate = returnDate;
    }

    const data = await amadeusGet('/v2/shopping/flight-offers', params) as {
      data?: Array<Record<string, unknown>>;
    };

    // Transform Amadeus response to simplified format
    const offers = (data.data || []).map((offer: Record<string, unknown>) => {
      const itineraries = offer.itineraries as Array<{
        segments: Array<{
          carrierCode: string;
          number: string;
          departure: { iataCode: string; at: string };
          arrival: { iataCode: string; at: string };
        }>;
        duration: string;
      }>;
      const price = offer.price as { total: string; currency: string };

      const outbound = itineraries[0];
      const firstSegment = outbound.segments[0];
      const lastSegment = outbound.segments[outbound.segments.length - 1];

      return {
        id: offer.id,
        airline: firstSegment.carrierCode,
        flightNumber: `${firstSegment.carrierCode}${firstSegment.number}`,
        origin: firstSegment.departure.iataCode,
        destination: lastSegment.arrival.iataCode,
        departureAt: firstSegment.departure.at,
        arrivalAt: lastSegment.arrival.at,
        duration: outbound.duration,
        stops: outbound.segments.length - 1,
        price: parseFloat(price.total),
        currency: price.currency,
        segments: outbound.segments.map((seg) => ({
          airline: seg.carrierCode,
          flightNumber: `${seg.carrierCode}${seg.number}`,
          origin: seg.departure.iataCode,
          destination: seg.arrival.iataCode,
          departureAt: seg.departure.at,
          arrivalAt: seg.arrival.at,
        })),
        returnItinerary: itineraries[1]
          ? {
              duration: itineraries[1].duration,
              stops: itineraries[1].segments.length - 1,
              segments: itineraries[1].segments.map((seg) => ({
                airline: seg.carrierCode,
                flightNumber: `${seg.carrierCode}${seg.number}`,
                origin: seg.departure.iataCode,
                destination: seg.arrival.iataCode,
                departureAt: seg.departure.at,
                arrivalAt: seg.arrival.at,
              })),
            }
          : null,
      };
    });

    return NextResponse.json(offers);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Flight search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
