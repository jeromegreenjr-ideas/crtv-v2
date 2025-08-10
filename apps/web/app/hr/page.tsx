"use client";
import { useEffect, useState } from 'react';
import RequireRole from '../../components/RequireRole';

export default function HRDashboard() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [form, setForm] = useState({ checkpointId: '', reviewerRole: 'hr', quality: '3', timeliness: '3', collaboration: '3', comment: '' });
  useEffect(() => { fetch('/api/hr/alerts').then(r => r.json()).then(j => setAlerts(j.alerts || [])); }, []);
  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      checkpointId: Number(form.checkpointId),
      reviewerRole: form.reviewerRole,
      scores: { quality: Number(form.quality), timeliness: Number(form.timeliness), collaboration: Number(form.collaboration) },
      comment: form.comment,
    };
    await fetch('/api/hr/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    alert('Review submitted');
  }
  return (
    <RequireRole allow={["hr","director","pm"]}>
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">HR Quality & Evaluation</h1>
        <div className="card">
          <div className="font-semibold mb-2">Alerts</div>
          <div className="space-y-2">
            {alerts.map((a, idx) => (
              <div key={idx} className="border rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.type.replace('_',' ')}</div>
                  <div className="text-sm text-gray-600">Project {a.projectId} · Checkpoint {a.checkpointId}</div>
                </div>
                <div className="text-xs text-gray-600">{Object.entries(a).filter(([k]) => !['type','projectId','checkpointId'].includes(k)).map(([k,v]) => `${k}:${v}`).join(' · ')}</div>
              </div>
            ))}
            {alerts.length === 0 && <div className="text-sm text-gray-600">No alerts</div>}
          </div>
        </div>
        <form onSubmit={submitReview} className="card space-y-3">
          <div className="font-semibold">Submit Checkpoint Review</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Checkpoint ID" value={form.checkpointId} onChange={(e) => setForm({ ...form, checkpointId: e.target.value })} required />
            <select className="border rounded px-2 py-1" value={form.reviewerRole} onChange={(e) => setForm({ ...form, reviewerRole: e.target.value })}>
              <option value="director">Director</option>
              <option value="pm">PM</option>
              <option value="producer">Producer (self)</option>
              <option value="hr">HR</option>
            </select>
            <input className="border rounded px-2 py-1" placeholder="Quality 1-5" value={form.quality} onChange={(e) => setForm({ ...form, quality: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Timeliness 1-5" value={form.timeliness} onChange={(e) => setForm({ ...form, timeliness: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Collaboration 1-5" value={form.collaboration} onChange={(e) => setForm({ ...form, collaboration: e.target.value })} />
          </div>
          <textarea className="border rounded px-2 py-1" placeholder="Comment" value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} />
          <div>
            <button type="submit" className="btn-primary">Submit</button>
          </div>
        </form>
      </div>
    </RequireRole>
  );
}


