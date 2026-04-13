import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { data, error } = await getSupabase()
    .from('trips')
    .select('*')
    .eq('clerk_user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const body = await req.json();

  const { data, error } = await getSupabase()
    .from('trips')
    .insert({
      clerk_user_id: userId,
      title: body.title,
      destination: body.destination,
      country: body.country || null,
      country_code: body.country_code || null,
      currency: body.currency || 'USD',
      image_url: body.image_url || null,
      start_date: body.start_date || null,
      end_date: body.end_date || null,
      num_travelers: body.num_travelers || 1,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
