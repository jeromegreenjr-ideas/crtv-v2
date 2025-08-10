import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getTasksByAssignee, getUserByEmail } from '../../lib/data';

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Tasks</h1>
      {list.length === 0 ? (
        <div className="card">No tasks assigned.</div>
      ) : (
        <div className="space-y-3">
          {list.map((t: any) => (
            <div key={t.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-sm text-gray-600">{t.status}</div>
              </div>
              <div className="text-sm text-gray-600">Due {t.due ? new Date(t.due).toLocaleDateString() : '-'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


