import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;

  const { data, error } = await getSupabase()
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;
  const body = await req.json();

  const { data, error } = await getSupabase()
    .from('trips')
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .eq('clerk_user_id', userId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId } = await params;

  const { error } = await getSupabase()
    .from('trips')
    .delete()
    .eq('id', tripId)
    .eq('clerk_user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
