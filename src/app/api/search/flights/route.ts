import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';
import { searchFlights } from '@/lib/amadeus';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');
  const departureDate = searchParams.get('departureDate');
  const returnDate = searchParams.get('returnDate');
  const adults = searchParams.get('adults');

  if (!origin || !destination || !departureDate) {
    return NextResponse.json(
      { error: 'origin, destination, and departureDate are required' },
      { status: 400 }
    );
  }

  if (!process.env.SERPAPI_API_KEY) {
    return NextResponse.json(
      { error: 'Flight search not configured. Add SERPAPI_API_KEY to .env.local' },
      { status: 503 }
    );
  }

  try {
    const data = await searchFlights({
      origin,
      destination,
      outboundDate: departureDate,
      returnDate: returnDate || undefined,
      adults: adults ? parseInt(adults) : undefined,
    });

    // Combine best_flights and other_flights, limit to 10 total
    const allOffers = [
      ...(data.best_flights || []),
      ...(data.other_flights || []),
    ].slice(0, 10);

    const offers = allOffers.map((offer, i) => {
      const firstFlight = offer.flights[0];
      const lastFlight = offer.flights[offer.flights.length - 1];

      return {
        id: `flight-${i}`,
        airline: firstFlight.airline,
        airlineLogo: firstFlight.airline_logo,
        flightNumber: firstFlight.flight_number,
        origin: firstFlight.departure_airport.id,
        originAirport: firstFlight.departure_airport.name,
        destination: lastFlight.arrival_airport.id,
        destinationAirport: lastFlight.arrival_airport.name,
        departureAt: firstFlight.departure_airport.time,
        arrivalAt: lastFlight.arrival_airport.time,
        totalDuration: offer.total_duration,
        stops: offer.flights.length - 1,
        layovers: (offer.layovers || []).map((l) => ({
          airport: l.id,
          airportName: l.name,
          duration: l.duration,
        })),
        price: offer.price,
        currency: 'USD',
        type: offer.type,
        segments: offer.flights.map((seg) => ({
          airline: seg.airline,
          airlineLogo: seg.airline_logo,
          flightNumber: seg.flight_number,
          origin: seg.departure_airport.id,
          destination: seg.arrival_airport.id,
          departureAt: seg.departure_airport.time,
          arrivalAt: seg.arrival_airport.time,
          duration: seg.duration,
          airplane: seg.airplane,
        })),
      };
    });

    return NextResponse.json({
      flights: offers,
      priceInsights: data.price_insights || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Flight search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
