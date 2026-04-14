import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

// Uses SerpAPI Google Local Results instead of Foursquare
export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const near = searchParams.get('near');

  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Search API not configured' },
      { status: 503 }
    );
  }

  try {
    const searchQuery = near ? `${query} in ${near}` : query;
    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('engine', 'google_local');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('api_key', apiKey);
    url.searchParams.set('hl', 'en');

    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`SerpAPI error: ${res.status}`);
    }

    const data = await res.json();

    if (data.error) {
      throw new Error(`SerpAPI: ${data.error}`);
    }

    const places = (data.local_results || []).slice(0, 8).map((p: {
      place_id: string;
      title: string;
      address: string;
      rating: number;
      reviews: number;
      type: string;
      thumbnail: string;
      gps_coordinates?: { latitude: number; longitude: number };
    }, i: number) => ({
      id: p.place_id || `place-${i}`,
      name: p.title,
      address: p.address || null,
      categories: p.type ? [p.type] : [],
      photo: p.thumbnail || null,
      rating: p.rating || null,
      reviews: p.reviews || 0,
    }));

    return NextResponse.json(places);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Place search failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
