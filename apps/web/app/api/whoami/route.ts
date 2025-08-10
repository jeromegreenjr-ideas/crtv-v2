import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserByEmail, upsertUserByEmail } from '../../../lib/data';

export const runtime = 'nodejs';

export async function GET() {
  const cookieStore = cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return NextResponse.json({ authenticated: false });

  // Map auth email to DB user; do not overwrite role if user exists
  const existing = await getUserByEmail(user.email);
  const dbUser = existing || await upsertUserByEmail(user.email, 'stakeholder');

  return NextResponse.json({ authenticated: true, email: user.email, id: dbUser.id, role: dbUser.role });
}


