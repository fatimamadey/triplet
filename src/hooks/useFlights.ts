import useSWR from 'swr';
import { Flight } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

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
  flightNumber: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  duration: string;
  stops: number;
  price: number;
  currency: string;
  segments: Array<{
    airline: string;
    flightNumber: string;
    origin: string;
    destination: string;
    departureAt: string;
    arrivalAt: string;
  }>;
  returnItinerary: {
    duration: string;
    stops: number;
    segments: Array<{
      airline: string;
      flightNumber: string;
      origin: string;
      destination: string;
      departureAt: string;
      arrivalAt: string;
    }>;
  } | null;
}

export function useFlightSearch(params: FlightSearchParams | null) {
  const searchKey = params
    ? `/api/search/flights?origin=${params.origin}&destination=${params.destination}&departureDate=${params.departureDate}${params.returnDate ? `&returnDate=${params.returnDate}` : ''}&adults=${params.adults || 1}`
    : null;

  const { data, error, isLoading } = useSWR<FlightOffer[]>(
    searchKey,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    results: data || [],
    isLoading,
    isError: !!error,
    error: error,
  };
}
