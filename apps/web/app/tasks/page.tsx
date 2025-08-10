import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getTasksByAssignee, getUserByEmail } from '../../lib/data';
import RequireRole from '../../components/RequireRole';

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
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">My Tasks</h1>
      {list.length === 0 ? (
        <div className="card">No tasks assigned.</div>
      ) : (
        <div className="space-y-3">
          {list.map((t: any) => {
            const statusMap: Record<string, string> = {
              todo: 'bg-status-todo/15 text-status-todo',
              in_progress: 'bg-status-progress/15 text-status-progress',
              review: 'bg-status-review/15 text-status-review',
              done: 'bg-status-success/15 text-status-success',
              blocked: 'bg-status-danger/15 text-status-danger',
            };
            const badge = statusMap[t.status] || 'bg-gray-100 text-gray-700';
            return (
              <div key={t.id} className="card flex items-center justify-between">
                <div>
                  <div className="font-medium">{t.title}</div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>{t.status}</span>
                </div>
                <div className="text-sm text-gray-600">Due {t.due ? new Date(t.due).toLocaleDateString() : '-'}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
    </RequireRole>
  );
}


