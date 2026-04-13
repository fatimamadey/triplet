import useSWR from 'swr';
import { Favorite } from '@/lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) return [];
  return res.json();
};

export function useFavorites() {
  const { data, error, isLoading, mutate } = useSWR<Favorite[]>(
    '/api/favorites',
    fetcher
  );

  return {
    favorites: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export function useIsFavorited(tripId: string | null) {
  const { favorites } = useFavorites();
  return favorites.some((f) => f.trip_id === tripId);
}
