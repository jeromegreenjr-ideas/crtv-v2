"use client";

import { useState } from 'react';

export default function ProducerAssessPage() {
  const [links, setLinks] = useState('https://www.linkedin.com/in/example');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/producer/assess/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links: links.split(/\s|,|\n/).filter(Boolean) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Producer Assessment</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <textarea className="input-field h-28" value={links} onChange={e=>setLinks(e.target.value)} placeholder="Paste portfolio links (comma or newline separated)" />
        <button className="btn-primary" disabled={loading}>{loading ? 'Assessing...' : 'Assess'}</button>
      </form>
      {error && <p className="text-red-600">{error}</p>}
      {result && (
        <div className="card">
          <div className="mb-2"><strong>Tier:</strong> {result.tier}</div>
          <div className="mb-2"><strong>Quality Effort:</strong> {Math.round(result.qualityEffort*100)}%</div>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.scores).map(([k, v]: any) => (
              <div key={k} className="bg-gray-50 rounded p-3">
                <div className="font-medium capitalize">{k.replace('_',' ')}</div>
                <div className="text-sm">Score: {v.score} / 10</div>
                <div className="text-xs text-gray-500">Confidence: {Math.round(v.confidence*100)}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}