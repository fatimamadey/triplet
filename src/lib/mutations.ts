import { mutate } from 'swr';
import { CreateTripInput } from '@/lib/types';

export async function createTrip(data: CreateTripInput) {
  const res = await fetch('/api/trips', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to create trip');
  }

  const trip = await res.json();
  mutate('/api/trips');
  return trip;
}

export async function updateTrip(tripId: string, data: Partial<CreateTripInput>) {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to update trip');
  }

  const trip = await res.json();
  mutate('/api/trips');
  mutate(`/api/trips/${tripId}`);
  return trip;
}

export async function deleteTrip(tripId: string) {
  const res = await fetch(`/api/trips/${tripId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to delete trip');
  }

  mutate('/api/trips');
  return true;
}

// Flight mutations

export async function addFlight(tripId: string, data: {
  airline?: string;
  flight_number?: string;
  origin: string;
  destination: string;
  departure_at?: string;
  arrival_at?: string;
  price?: number;
  currency?: string;
  passengers?: number;
  amadeus_offer_id?: string;
  raw_data?: unknown;
}) {
  const res = await fetch(`/api/trips/${tripId}/flights`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add flight');
  }

  const flight = await res.json();
  mutate(`/api/trips/${tripId}/flights`);
  mutate(`/api/trips/${tripId}/costs`);
  return flight;
}

export async function removeFlight(tripId: string, flightId: string) {
  const res = await fetch(`/api/trips/${tripId}/flights/${flightId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to remove flight');
  }

  mutate(`/api/trips/${tripId}/flights`);
  mutate(`/api/trips/${tripId}/costs`);
  return true;
}

// Hotel mutations

export async function addHotel(tripId: string, data: {
  name: string;
  address?: string;
  check_in?: string;
  check_out?: string;
  price_per_night?: number;
  total_price?: number;
  currency?: string;
  rooms?: number;
  rating?: number;
  image_url?: string;
}) {
  const res = await fetch(`/api/trips/${tripId}/hotels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add hotel');
  }

  const hotel = await res.json();
  mutate(`/api/trips/${tripId}/hotels`);
  mutate(`/api/trips/${tripId}/costs`);
  return hotel;
}

export async function removeHotel(tripId: string, hotelId: string) {
  const res = await fetch(`/api/trips/${tripId}/hotels/${hotelId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to remove hotel');
  }

  mutate(`/api/trips/${tripId}/hotels`);
  mutate(`/api/trips/${tripId}/costs`);
  return true;
}

// Itinerary mutations

export async function generateDays(tripId: string) {
  const res = await fetch(`/api/trips/${tripId}/itinerary`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'generate' }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate days');
  }

  mutate(`/api/trips/${tripId}/itinerary`);
  return res.json();
}

export async function addItineraryItem(tripId: string, dayId: string, data: {
  title: string;
  category?: string;
  start_time?: string;
  end_time?: string;
  estimated_cost?: number;
  currency?: string;
  notes?: string;
  place_id?: string;
  place_data?: unknown;
}) {
  const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to add item');
  }

  mutate(`/api/trips/${tripId}/itinerary`);
  mutate(`/api/trips/${tripId}/costs`);
  return res.json();
}

export async function removeItineraryItem(tripId: string, dayId: string, itemId: string) {
  const res = await fetch(`/api/trips/${tripId}/itinerary/${dayId}/items/${itemId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to remove item');
  }

  mutate(`/api/trips/${tripId}/itinerary`);
  mutate(`/api/trips/${tripId}/costs`);
  return true;
}

// Share mutations

export async function generateShareToken(tripId: string): Promise<string> {
  const res = await fetch(`/api/trips/${tripId}/share`, {
    method: 'POST',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate share link');
  }

  const { shareToken } = await res.json();
  return shareToken;
}

// Favorite mutations

export async function addFavorite(tripId: string) {
  const res = await fetch('/api/favorites', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tripId }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to favorite');
  }

  mutate('/api/favorites');
  return res.json();
}

export async function removeFavorite(tripId: string) {
  const res = await fetch(`/api/favorites?tripId=${tripId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to unfavorite');
  }

  mutate('/api/favorites');
  return true;
}
