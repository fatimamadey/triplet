import useSWR from 'swr';
import { TripCosts } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useTripCosts(tripId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<TripCosts>(
    tripId ? `/api/trips/${tripId}/costs` : null,
    fetcher
  );

  return {
    costs: data,
    isLoading,
    isError: !!error,
    mutate,
  };
}
