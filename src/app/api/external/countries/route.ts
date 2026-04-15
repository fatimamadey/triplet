import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

// Common city → country mappings for when REST Countries API can't match
const CITY_COUNTRY_MAP: Record<string, { country: string; code: string; currency: string }> = {
  'paris': { country: 'France', code: 'FR', currency: 'EUR' },
  'london': { country: 'United Kingdom', code: 'GB', currency: 'GBP' },
  'tokyo': { country: 'Japan', code: 'JP', currency: 'JPY' },
  'rome': { country: 'Italy', code: 'IT', currency: 'EUR' },
  'barcelona': { country: 'Spain', code: 'ES', currency: 'EUR' },
  'madrid': { country: 'Spain', code: 'ES', currency: 'EUR' },
  'berlin': { country: 'Germany', code: 'DE', currency: 'EUR' },
  'amsterdam': { country: 'Netherlands', code: 'NL', currency: 'EUR' },
  'bangkok': { country: 'Thailand', code: 'TH', currency: 'THB' },
  'dubai': { country: 'United Arab Emirates', code: 'AE', currency: 'AED' },
  'istanbul': { country: 'Turkey', code: 'TR', currency: 'TRY' },
  'seoul': { country: 'South Korea', code: 'KR', currency: 'KRW' },
  'sydney': { country: 'Australia', code: 'AU', currency: 'AUD' },
  'toronto': { country: 'Canada', code: 'CA', currency: 'CAD' },
  'vancouver': { country: 'Canada', code: 'CA', currency: 'CAD' },
  'new york': { country: 'United States', code: 'US', currency: 'USD' },
  'los angeles': { country: 'United States', code: 'US', currency: 'USD' },
  'chicago': { country: 'United States', code: 'US', currency: 'USD' },
  'miami': { country: 'United States', code: 'US', currency: 'USD' },
  'san francisco': { country: 'United States', code: 'US', currency: 'USD' },
  'mexico city': { country: 'Mexico', code: 'MX', currency: 'MXN' },
  'cancun': { country: 'Mexico', code: 'MX', currency: 'MXN' },
  'rio de janeiro': { country: 'Brazil', code: 'BR', currency: 'BRL' },
  'buenos aires': { country: 'Argentina', code: 'AR', currency: 'ARS' },
  'lisbon': { country: 'Portugal', code: 'PT', currency: 'EUR' },
  'prague': { country: 'Czech Republic', code: 'CZ', currency: 'CZK' },
  'vienna': { country: 'Austria', code: 'AT', currency: 'EUR' },
  'athens': { country: 'Greece', code: 'GR', currency: 'EUR' },
  'mumbai': { country: 'India', code: 'IN', currency: 'INR' },
  'delhi': { country: 'India', code: 'IN', currency: 'INR' },
  'singapore': { country: 'Singapore', code: 'SG', currency: 'SGD' },
  'hong kong': { country: 'Hong Kong', code: 'HK', currency: 'HKD' },
  'cairo': { country: 'Egypt', code: 'EG', currency: 'EGP' },
  'marrakech': { country: 'Morocco', code: 'MA', currency: 'MAD' },
  'nairobi': { country: 'Kenya', code: 'KE', currency: 'KES' },
  'cape town': { country: 'South Africa', code: 'ZA', currency: 'ZAR' },
  'beijing': { country: 'China', code: 'CN', currency: 'CNY' },
  'shanghai': { country: 'China', code: 'CN', currency: 'CNY' },
  'osaka': { country: 'Japan', code: 'JP', currency: 'JPY' },
  'kyoto': { country: 'Japan', code: 'JP', currency: 'JPY' },
  'florence': { country: 'Italy', code: 'IT', currency: 'EUR' },
  'milan': { country: 'Italy', code: 'IT', currency: 'EUR' },
  'nice': { country: 'France', code: 'FR', currency: 'EUR' },
  'zurich': { country: 'Switzerland', code: 'CH', currency: 'CHF' },
  'stockholm': { country: 'Sweden', code: 'SE', currency: 'SEK' },
  'copenhagen': { country: 'Denmark', code: 'DK', currency: 'DKK' },
  'dublin': { country: 'Ireland', code: 'IE', currency: 'EUR' },
  'edinburgh': { country: 'United Kingdom', code: 'GB', currency: 'GBP' },
  'milwaukee': { country: 'United States', code: 'US', currency: 'USD' },
};

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const name = searchParams.get('name');

  if (!name) {
    return NextResponse.json({ error: 'name parameter required' }, { status: 400 });
  }

  // First try city mapping
  const cityMatch = CITY_COUNTRY_MAP[name.toLowerCase().trim()];
  if (cityMatch) {
    return NextResponse.json([{
      name: cityMatch.country,
      code: cityMatch.code,
      currency: cityMatch.currency,
    }]);
  }

  // Then try REST Countries API
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
  }));

  return NextResponse.json(countries);
}
