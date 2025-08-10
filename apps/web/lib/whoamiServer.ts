import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getUserByEmail, upsertUserByEmail, getProducerProfile } from './data';

export async function getWhoAmI() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return { authenticated: false };
  }
  const supabase = createServerComponentClient({ cookies });
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return { authenticated: false };
  const existing = await getUserByEmail(user.email);
  const dbUser = existing || await upsertUserByEmail(user.email, 'stakeholder');
  const producerProfile = dbUser.role === 'producer' ? await getProducerProfile(dbUser.id) : null;
  return {
    authenticated: true,
    email: user.email,
    id: dbUser.id,
    role: dbUser.role,
    profile: producerProfile ? { slug: producerProfile.publicSlug, tier: producerProfile.crtvTier } : null,
  };
}


