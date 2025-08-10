import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getIdeasByStakeholder, computeIdeaProgress, getUserByEmail } from '../../../lib/data';

export default async function StakeholderDashboard() {
  const supabase = (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    ? createServerComponentClient({ cookies })
    : null as any;
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <div className="card text-center">
          <p className="mb-4">Please sign in to view your dashboard.</p>
          <Link className="btn-primary" href="/signin">Sign in</Link>
        </div>
      </div>
    );
  }

  const stakeholderEmail = user.email || '';
  const dbUser = stakeholderEmail ? await getUserByEmail(stakeholderEmail) : null;
  const userId = dbUser?.id;
  const ideas = userId ? await getIdeasByStakeholder(userId) : [] as any[];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Stakeholder Dashboard</h1>
        <Link href="/studio/new" className="btn-primary">Start a new idea</Link>
      </div>
      <p className="text-gray-600 mb-6">Welcome {stakeholderEmail}. Here’s your portfolio of ideas.</p>

      {ideas.length === 0 ? (
        <div className="card">
          <p className="text-gray-700">No ideas yet. Start your first idea to see progress and activity here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {await Promise.all(ideas.map(async (i: any) => {
            const p = await computeIdeaProgress(i.id);
            return (
              <Link key={i.id} href={`/ideas/${i.id}`} className="card hover:shadow-md transition">
                <h3 className="font-semibold mb-2 line-clamp-2">{i.summary}</h3>
                <div className="text-sm text-gray-600">{p.completionPct}% complete · {p.projects} phases · {p.checkpoints} checkpoints · {p.tasks} tasks</div>
              </Link>
            );
          }))}
        </div>
      )}
    </div>
  );
}


