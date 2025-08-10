import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createIdeaProfile, getIdeaProfileByIdeaId } from '../../../../lib/data';

export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getUser();
  if (!data.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const ideaId = Number(body?.ideaId);
  const isPublic = Boolean(body?.isPublic);
  if (!ideaId) return NextResponse.json({ error: 'Missing ideaId' }, { status: 400 });
  const existing = await getIdeaProfileByIdeaId(ideaId);
  const res = await createIdeaProfile(ideaId, { slug: existing?.slug || `idea-${ideaId}`, isPublic });
  return NextResponse.json({ success: true, profile: res });
}


