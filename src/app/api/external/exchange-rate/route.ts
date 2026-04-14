import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { searchParams } = new URL(req.url);
  const from = searchParams.get('from') || 'USD';
  const to = searchParams.get('to');

  if (!to) {
    return NextResponse.json({ error: 'to currency required' }, { status: 400 });
  }

  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Exchange rate API not configured' },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${from}/${to}`,
      { next: { revalidate: 3600 } } // cache for 1 hour
    );

    if (!res.ok) {
      throw new Error(`Exchange rate API error: ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      from: data.base_code,
      to: data.target_code,
      rate: data.conversion_rate,
      lastUpdated: data.time_last_update_utc,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Exchange rate fetch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
