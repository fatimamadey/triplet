import useSWR from 'swr';
import { ItineraryDay } from '@/lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export function useItinerary(tripId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<ItineraryDay[]>(
    tripId ? `/api/trips/${tripId}/itinerary` : null,
    fetcher
  );

  return {
    days: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
