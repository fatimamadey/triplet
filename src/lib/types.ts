export interface Trip {
  id: string;
  clerk_user_id: string;
  title: string;
  destination: string;
  country: string | null;
  country_code: string | null;
  currency: string;
  image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  num_travelers: number;
  share_token: string | null;
  status: 'planning' | 'ready';
  created_at: string;
  updated_at: string;
}

export interface Flight {
  id: string;
  trip_id: string;
  clerk_user_id: string;
  airline: string | null;
  flight_number: string | null;
  origin: string;
  destination: string;
  departure_at: string | null;
  arrival_at: string | null;
  price: number | null;
  currency: string;
  passengers: number;
  booking_url: string | null;
  amadeus_offer_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface Hotel {
  id: string;
  trip_id: string;
  clerk_user_id: string;
  name: string;
  address: string | null;
  check_in: string | null;
  check_out: string | null;
  price_per_night: number | null;
  total_price: number | null;
  currency: string;
  rooms: number;
  rating: number | null;
  image_url: string | null;
  amadeus_hotel_id: string | null;
  raw_data: Record<string, unknown> | null;
  created_at: string;
}

export interface ItineraryDay {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  notes: string | null;
  created_at: string;
  items?: ItineraryItem[];
}

export interface ItineraryItem {
  id: string;
  day_id: string;
  trip_id: string;
  sort_order: number;
  title: string;
  category: 'restaurant' | 'attraction' | 'activity' | 'transport' | 'shopping' | 'other';
  start_time: string | null;
  end_time: string | null;
  estimated_cost: number;
  currency: string;
  notes: string | null;
  place_id: string | null;
  place_data: PlaceData | null;
  created_at: string;
}

export interface PlaceData {
  name: string;
  rating?: number;
  photo_url?: string;
  address?: string;
  lat?: number;
  lng?: number;
  categories?: string[];
}

export interface Favorite {
  id: string;
  clerk_user_id: string;
  trip_id: string;
  created_at: string;
  trip?: Trip;
}

export interface TripCosts {
  flights: { total: number; currency: string; count: number };
  hotels: { total: number; currency: string; count: number };
  activities: { total: number; currency: string; count: number };
  grandTotal: number;
  perPerson: number;
  numTravelers: number;
}

export interface CreateTripInput {
  title: string;
  destination: string;
  country?: string;
  country_code?: string;
  currency?: string;
  image_url?: string;
  start_date?: string;
  end_date?: string;
  num_travelers?: number;
}
