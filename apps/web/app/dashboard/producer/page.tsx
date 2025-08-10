import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getLatestProducerLevel } from '../../../lib/data';

export default async function ProducerDashboard() {
  const cookieStore = cookies();
  const supabase = createPagesServerClient({ cookies: () => cookieStore });
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Producer Dashboard</h1>
        <Link href="/onboarding/producer" className="btn-secondary">Re-assess</Link>
      </div>
      <div className="card">
        <p>Your latest assessment will be shown here after we map auth user to DB user.</p>
        <p className="text-gray-600">For now, you can re-run assessment via Onboarding.</p>
      </div>
    </div>
  );
}


