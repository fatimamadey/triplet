import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ tripId: string; hotelId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const { tripId, hotelId } = await params;

  const { error } = await getSupabase()
    .from('hotels')
    .delete()
    .eq('id', hotelId)
    .eq('trip_id', tripId)
    .eq('clerk_user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
