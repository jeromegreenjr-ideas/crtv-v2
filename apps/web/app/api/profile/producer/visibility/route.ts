import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createOrUpdateProducerProfile, getProducerProfile } from '../../../../lib/data';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const isPublic = Boolean(body?.isPublic);
  const profile = await getProducerProfile(0); // Placeholder: map email->userId in DB if available
  const userId = profile?.userId || 0;
  const updated = await createOrUpdateProducerProfile(userId, { isPublic });
  return NextResponse.json({ success: true, profile: updated });
}


