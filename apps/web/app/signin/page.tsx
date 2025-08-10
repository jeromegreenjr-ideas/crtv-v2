"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const router = useRouter();

  async function submit() {
    setError(null);
    const res = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode === 'in' ? 'signIn' : 'signUp', email, password })
    });
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || 'Auth failed');
      return;
    }
    // TODO: fetch role and route accordingly; for now route to general Ideas
    // After sign-in, route based on role
    try {
      const who = await fetch('/api/whoami', { cache: 'no-store' }).then(r => r.json());
      if (who?.role === 'producer') router.push('/dashboard/producer');
      else router.push('/dashboard/stakeholder');
    } catch {
      router.push('/ideas');
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">{mode === 'in' ? 'Sign in' : 'Sign up'}</h1>
        <div className="space-y-4">
          <input className="input-field" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="input-field" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full" onClick={submit}>{mode === 'in' ? 'Sign in' : 'Create account'}</button>
          <button className="btn-secondary w-full" onClick={() => setMode(mode === 'in' ? 'up' : 'in')}>
            {mode === 'in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}


