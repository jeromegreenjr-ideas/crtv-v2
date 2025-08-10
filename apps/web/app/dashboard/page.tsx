import { cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import RequireRole from '../../components/RequireRole';
import { getUserByEmail, getIdeasByStakeholder, getAllProjects } from '../../lib/data';
import { Avatar } from '../../components/Avatar';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function StakeholderDashboard() {
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? createServerComponentClient({ cookies })
    : null as any;
  const { data } = supabase ? await supabase.auth.getUser() : { data: { user: null } } as any;
  const email = data.user?.email as string | undefined;
  const dbUser = email ? await getUserByEmail(email) : null;
  const stakeholderId = dbUser?.id || 0;
  const ideas = stakeholderId ? await getIdeasByStakeholder(stakeholderId) : [];
  const projects = await getAllProjects();
  const activeIdeas = ideas.filter((i: any) => i.status === 'active');
  const pendingApprovals = ideas.filter((i: any) => ['submitted','assessed'].includes(i.status));

  return (
    <RequireRole allow={["stakeholder"]}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <div className="text-sm text-gray-600">Active Ideas</div>
            <div className="text-3xl font-bold">{activeIdeas.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Projects In Progress</div>
            <div className="text-3xl font-bold">{projects.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Pending Approvals</div>
            <div className="text-3xl font-bold">{pendingApprovals.length}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Alerts</div>
            <div className="text-3xl font-bold">0</div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Your Ideas</h2>
            <Link href="/ideas" className="text-primary-600 text-sm">View all</Link>
          </div>
          {ideas.length === 0 ? (
            <div className="text-sm text-gray-600">No ideas yet.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-3">
              {ideas.map((i: any) => (
                <Link key={i.id} href={`/ideas/${i.id}`} className="border rounded-xl p-3 hover:bg-gray-50">
                  <div className="font-medium line-clamp-2">{i.title || i.summary}</div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-600">Status: {i.status}</div>
                    <div className="flex -space-x-2">
                      {[1,2,3].map((n) => (
                        <Avatar key={n} name={`User ${n}`} size={24} />
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Alerts</h2>
            <Link href="#" className="text-primary-600 text-sm">View all</Link>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center justify-between border rounded-xl p-3">
              <div>
                <div className="font-medium">No recent alerts</div>
                <div className="text-sm text-gray-600">You’re all caught up.</div>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </RequireRole>
  );
}


