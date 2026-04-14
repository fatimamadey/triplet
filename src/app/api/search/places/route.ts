import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const near = searchParams.get('near');

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const apiKey = process.env.FOURSQUARE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Foursquare API not configured' },
      { status: 503 }
    );
  }

  try {
    const url = new URL('https://api.foursquare.com/v3/places/search');
    url.searchParams.set('query', query);
    url.searchParams.set('limit', '8');

    if (near) {
      url.searchParams.set('near', near);
    }

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: apiKey,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      throw new Error(`Foursquare API error: ${res.status}`);
    }

    const data = await res.json();

    const places = (data.results || []).map((p: {
      fsq_id: string;
      name: string;
      location?: { formatted_address?: string; address?: string; locality?: string };
      categories?: Array<{ name: string; short_name: string }>;
      photos?: Array<{ prefix: string; suffix: string }>;
      distance?: number;
      rating?: number;
    }) => ({
      id: p.fsq_id,
      name: p.name,
      address: p.location?.formatted_address || p.location?.address || null,
      locality: p.location?.locality || null,
      categories: (p.categories || []).map((c) => c.short_name || c.name),
      photo: p.photos?.[0]
        ? `${p.photos[0].prefix}200x200${p.photos[0].suffix}`
        : null,
      distance: p.distance || null,
      rating: p.rating || null,
    }));

    return NextResponse.json(places);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Place search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
