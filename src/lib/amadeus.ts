// SerpAPI Google Flights + Hotels helper
// Free tier: 100 searches/month — use sparingly!

const SERPAPI_BASE = 'https://serpapi.com/search';

export async function searchFlights(params: {
  origin: string;
  destination: string;
  outboundDate: string;
  returnDate?: string;
  adults?: number;
}): Promise<SerpFlightResponse> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error('SerpAPI not configured. Add SERPAPI_API_KEY to .env.local');
  }

  const url = new URL(SERPAPI_BASE);
  url.searchParams.set('engine', 'google_flights');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('departure_id', params.origin.toUpperCase());
  url.searchParams.set('arrival_id', params.destination.toUpperCase());
  url.searchParams.set('outbound_date', params.outboundDate);
  url.searchParams.set('type', params.returnDate ? '1' : '2'); // 1=round trip, 2=one way
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('sort_by', '2'); // sort by price

  if (params.returnDate) {
    url.searchParams.set('return_date', params.returnDate);
  }

  if (params.adults && params.adults > 1) {
    url.searchParams.set('adults', String(params.adults));
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`SerpAPI error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`SerpAPI: ${data.error}`);
  }

  return data as SerpFlightResponse;
}

// Google Hotels search

export async function searchHotels(params: {
  query: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  vacationRentals?: boolean;
}): Promise<SerpHotelResponse> {
  const apiKey = process.env.SERPAPI_API_KEY;

  if (!apiKey) {
    throw new Error('SerpAPI not configured. Add SERPAPI_API_KEY to .env.local');
  }

  const url = new URL(SERPAPI_BASE);
  url.searchParams.set('engine', 'google_hotels');
  url.searchParams.set('api_key', apiKey);
  url.searchParams.set('q', params.query);
  url.searchParams.set('check_in_date', params.checkIn);
  url.searchParams.set('check_out_date', params.checkOut);
  url.searchParams.set('currency', 'USD');
  url.searchParams.set('hl', 'en');
  url.searchParams.set('sort_by', '3'); // sort by lowest price

  if (params.adults) {
    url.searchParams.set('adults', String(params.adults));
  }

  if (params.vacationRentals) {
    url.searchParams.set('vacation_rentals', 'true');
  }

  const res = await fetch(url.toString());

  if (!res.ok) {
    throw new Error(`SerpAPI error: ${res.status}`);
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(`SerpAPI: ${data.error}`);
  }

  return data as SerpHotelResponse;
}

// Types for SerpAPI Google Hotels response

export interface SerpHotelProperty {
  type: string;
  name: string;
  link: string;
  property_token: string;
  gps_coordinates: { latitude: number; longitude: number };
  rate_per_night: { lowest: string; extracted_lowest: number };
  total_rate: { lowest: string; extracted_lowest: number };
  overall_rating: number;
  reviews: number;
  images: Array<{ thumbnail: string; original_image: string }>;
  amenities: string[];
  hotel_class?: string;
  extracted_hotel_class?: number;
  check_in_time?: string;
  check_out_time?: string;
}

export interface SerpHotelResponse {
  properties?: SerpHotelProperty[];
  search_metadata?: { status: string };
}

// Types for SerpAPI Google Flights response

export interface SerpFlightSegment {
  departure_airport: { name: string; id: string; time: string };
  arrival_airport: { name: string; id: string; time: string };
  duration: number;
  airplane: string;
  airline: string;
  airline_logo: string;
  flight_number: string;
  travel_class: string;
  legroom: string;
  extensions: string[];
}

export interface SerpFlightLayover {
  duration: number;
  name: string;
  id: string;
}

export interface SerpFlightOffer {
  flights: SerpFlightSegment[];
  layovers?: SerpFlightLayover[];
  total_duration: number;
  price: number;
  type: string;
}

export interface SerpFlightResponse {
  best_flights?: SerpFlightOffer[];
  other_flights?: SerpFlightOffer[];
  price_insights?: {
    lowest_price: number;
    price_level: string;
    typical_price_range: [number, number];
  };
  search_metadata?: {
    status: string;
  };
}
