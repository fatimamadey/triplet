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
