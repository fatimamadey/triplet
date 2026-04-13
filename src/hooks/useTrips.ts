import useSWR from 'swr';
import { Trip } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTrips() {
  const { data, error, isLoading, mutate } = useSWR<Trip[]>(
    '/api/trips',
    fetcher
  );

  return {
    trips: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useTrip(tripId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Trip>(
    tripId ? `/api/trips/${tripId}` : null,
    fetcher
  );

  return {
    trip: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
