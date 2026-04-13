import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'query parameter required' }, { status: 400 });
  }

  const apiKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Unsplash API not configured' }, { status: 500 });
  }

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' travel city')}&per_page=1&orientation=landscape`,
    {
      headers: { Authorization: `Client-ID ${apiKey}` },
      next: { revalidate: 86400 },
    }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Unsplash API error' }, { status: 500 });
  }

  const data = await res.json();

  if (data.results && data.results.length > 0) {
    const photo = data.results[0];
    return NextResponse.json({
      url: photo.urls.regular,
      alt: photo.alt_description || query,
      credit: {
        name: photo.user.name,
        link: photo.user.links.html,
      },
    });
  }

  return NextResponse.json({ url: null });
}
