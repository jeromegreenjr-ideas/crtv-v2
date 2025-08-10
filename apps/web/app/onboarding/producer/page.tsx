"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { onboardProducer } from '../actions';
import { useEventSource } from '../../../hooks/useEventSource';

export default function ProducerOnboarding() {
  const [email, setEmail] = useState('');
  const [links, setLinks] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(formData: FormData) {
    setLoading(true); setError(null);
    const res = await onboardProducer(formData);
    setLoading(false);
    if ((res as any)?.error) { setError((res as any).error); return; }
    const userId = (res as any)?.userId;
    router.push(`/onboarding/producer/preview${userId ? `?userId=${userId}` : ''}`);
  }

  return (
    <div className="min-h-screen max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Submit your portfolio</h1>
      <form action={submit} className="space-y-4">
        <input name="email" className="input-field" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} />
        <textarea name="links" className="input-field" rows={6} placeholder="Links separated by spaces or lines" value={links} onChange={e=>setLinks(e.target.value)} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary" disabled={loading || !email || !links}>{loading ? 'Submitting...' : 'Get assessment'}</button>
      </form>
      <p className="text-sm text-gray-600 mt-4">We’ll assess your skills, then ask you to create an account to view your results.</p>
    </div>
  );
}


