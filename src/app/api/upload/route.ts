import { NextRequest, NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';
import { getAuthUserId, unauthorized } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId) return unauthorized();

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const tripId = formData.get('tripId') as string;

  if (!file || !tripId) {
    return NextResponse.json({ error: 'file and tripId required' }, { status: 400 });
  }

  const supabase = getSupabase();

  // Generate unique filename
  const ext = file.name.split('.').pop() || 'jpg';
  const filename = `${tripId}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('trip-photos')
    .upload(filename, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data: urlData } = supabase.storage
    .from('trip-photos')
    .getPublicUrl(filename);

  // Update the trip's image_url
  const { error: updateError } = await supabase
    .from('trips')
    .update({ image_url: urlData.publicUrl, updated_at: new Date().toISOString() })
    .eq('id', tripId)
    .eq('clerk_user_id', userId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ url: urlData.publicUrl });
}
