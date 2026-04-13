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
