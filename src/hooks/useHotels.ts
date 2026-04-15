import useSWR from 'swr';
import { Hotel } from '@/lib/types';

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

export function useHotels(tripId: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Hotel[]>(
    tripId ? `/api/trips/${tripId}/hotels` : null,
    fetcher
  );

  return {
    hotels: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}

export interface HotelSearchParams {
  query: string;
  checkIn: string;
  checkOut: string;
  adults?: number;
  type?: 'hotels' | 'rentals';
}

export interface HotelResult {
  id: string;
  name: string;
  type: string;
  link: string;
  pricePerNight: number | null;
  totalPrice: number | null;
  priceDisplay: string | null;
  rating: number | null;
  reviews: number;
  hotelClass: number | null;
  hotelClassLabel: string | null;
  image: string | null;
  images: string[];
  amenities: string[];
  coordinates: { latitude: number; longitude: number } | null;
  checkInTime: string | null;
  checkOutTime: string | null;
}

export function useHotelSearch(params: HotelSearchParams | null) {
  const searchKey = params
    ? `/api/search/hotels?query=${encodeURIComponent(params.query)}&checkIn=${params.checkIn}&checkOut=${params.checkOut}${params.adults ? `&adults=${params.adults}` : ''}${params.type ? `&type=${params.type}` : ''}`
    : null;

  const { data, error, isLoading } = useSWR<HotelResult[]>(
    searchKey,
    fetcher,
    { revalidateOnFocus: false }
  );

  return {
    results: data || [],
    isLoading,
    isError: !!error,
    errorMessage: error?.message || null,
  };
}
