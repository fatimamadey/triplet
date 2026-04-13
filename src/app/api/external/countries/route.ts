import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name parameter required' }, { status: 400 });
  }

  const res = await fetch(
    `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,cca2,currencies,flags`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) {
    return NextResponse.json({ error: 'Country not found' }, { status: 404 });
  }

  const data = await res.json();

  const countries = data.map((c: Record<string, unknown>) => ({
    name: (c.name as { common: string }).common,
    code: c.cca2 as string,
    currency: c.currencies
      ? Object.keys(c.currencies as Record<string, unknown>)[0]
      : 'USD',
    flag: (c.flags as { svg: string }).svg,
  }));

  return NextResponse.json(countries);
}
