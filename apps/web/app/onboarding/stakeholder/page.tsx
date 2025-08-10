"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardStakeholder } from '../actions';

export default function StakeholderOnboarding() {
  const [email, setEmail] = useState('');
  const [summary, setSummary] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(formData: FormData) {
    setLoading(true); setError(null);
    const res = await onboardStakeholder(formData);
    setLoading(false);
    if ((res as any)?.error) { setError((res as any).error); return; }
    // Incentivize sign up: show preview page before sign in
    const ideaId = (res as any)?.ideaId;
    router.push(`/onboarding/stakeholder/preview${ideaId ? `?ideaId=${ideaId}` : ''}`);
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Submit your idea</h1>
      <form action={submit} className="space-y-4">
        <input name="email" className="input-field" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea name="summary" className="input-field" rows={8} placeholder="Describe your idea" value={summary} onChange={e=>setSummary(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={loading || !email || !summary}>{loading ? 'Assessing Idea...' : 'Generate brief & plan'}</button>
      </form>
      {loading && (
        <div className="mt-4">
          <ol className="grid gap-2 text-sm">
            <li>1. Uploading</li>
            <li>2. Analyzing</li>
            <li>3. Building Preview</li>
          </ol>
        </div>
      )}
      <p className="text-sm text-gray-600 mt-4">We’ll generate your brief and plan, then ask you to create an account to view details.</p>
    </div>
  );
}


