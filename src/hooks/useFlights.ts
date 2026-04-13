import useSWR from 'swr';
import { Flight } from '@/lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export function useFlights(tripId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Flight[]>(
    tripId ? `/api/trips/${tripId}/flights` : null,
    fetcher
  );

  return {
    flights: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults?: number;
}

export interface FlightOffer {
  id: string;
  airline: string;
  airlineLogo: string;
  flightNumber: string;
  origin: string;
  originAirport: string;
  destination: string;
  destinationAirport: string;
  departureAt: string;
  arrivalAt: string;
  totalDuration: number;
  stops: number;
  layovers: Array<{ airport: string; airportName: string; duration: number }>;
  price: number;
  currency: string;
  type: string;
  segments: Array<{
    airline: string;
    airlineLogo: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
    duration: number;
    airplane: string;
  }>;
}

export interface PriceInsights {
  lowest_price: number;
  price_level: string;
  typical_price_range: [number, number];
}

export interface FlightSearchResponse {
  flights: FlightOffer[];
  priceInsights: PriceInsights | null;
}

export function useFlightSearch(params: FlightSearchParams | null) {
  const searchKey = params
    ? `/api/search/flights?origin=${params.origin}&destination=${params.destination}&departureDate=${params.departureDate}${params.returnDate ? `&returnDate=${params.returnDate}` : ''}${params.adults ? `&adults=${params.adults}` : ''}`
    : null;

  const { data, error, isLoading } = useSWR<FlightSearchResponse>(
    searchKey,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    results: data?.flights || [],
    priceInsights: data?.priceInsights || null,
    isLoading,
    isError: !!error,
    errorMessage: error?.message || null,
  };
}
