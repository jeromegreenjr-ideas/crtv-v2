import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createOrUpdateProducerProfile, getProducerProfile, getUserByEmail } from '../../../../lib/data';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const isPublic = Boolean(body?.isPublic);
  const dbUser = await getUserByEmail(data.user.email!);
  if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const userId = dbUser.id;
  const updated = await createOrUpdateProducerProfile(userId, { isPublic });
  return NextResponse.json({ success: true, profile: updated });
}


