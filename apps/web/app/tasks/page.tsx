import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getTasksByAssignee, getUserByEmail } from '../../lib/data';
import RequireRole from '../../components/RequireRole';
import ClientTasks from './tasks-client';

export const dynamic = 'force-dynamic';

export default async function MyTasks() {
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? createServerComponentClient({ cookies })
    : null as any;
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } } as any;
  const email = data.user?.email as string | undefined;
  const dbUser = email ? await getUserByEmail(email) : null;
  const list = dbUser ? await getTasksByAssignee(dbUser.id) : [];
  return (
    <RequireRole allow={["producer","pm","director","stakeholder","hr"]}>
      <ClientTasks initialTasks={list} />
    </RequireRole>
  );
}


