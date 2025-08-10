"use client";
export const dynamic = 'force-dynamic';

import RequireRole from '../../components/RequireRole';
import React, { useEffect, useState } from 'react';

type Meeting = { id: number; title: string; startAt?: string; duration?: number; attendees?: string[]; agenda?: string; notes?: string; checkpointId?: number; projectId?: number };

export default function CommunicationPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [form, setForm] = useState({ title: '', checkpointId: '', projectId: '', startAt: '', duration: '', attendees: '', agenda: '' });
  async function load() {
    const qs = form.checkpointId ? `?checkpointId=${form.checkpointId}` : form.projectId ? `?projectId=${form.projectId}` : '';
    const res = await fetch(`/api/meetings${qs}`);
    const j = await res.json();
    setMeetings(j.meetings || []);
  }
  useEffect(() => { load(); }, []);
  async function schedule(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title,
      checkpointId: form.checkpointId ? Number(form.checkpointId) : undefined,
      projectId: form.projectId ? Number(form.projectId) : undefined,
      startAt: form.startAt || undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      attendees: form.attendees ? form.attendees.split(',').map(s => s.trim()) : undefined,
      agenda: form.agenda || undefined,
    };
    const res = await fetch('/api/meetings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (res.ok) { setForm({ title: '', checkpointId: '', projectId: '', startAt: '', duration: '', attendees: '', agenda: '' }); load(); }
  }
  return (
    <RequireRole allow={["pm","director"]}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Communication</h1>
        <form onSubmit={schedule} className="card space-y-3">
          <div className="font-semibold">Schedule meeting</div>
          <div className="grid sm:grid-cols-2 gap-2">
            <input className="border rounded px-2 py-1" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="border rounded px-2 py-1" placeholder="Checkpoint ID (optional)" value={form.checkpointId} onChange={(e) => setForm({ ...form, checkpointId: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Project ID (optional)" value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} />
            <input type="datetime-local" className="border rounded px-2 py-1" placeholder="Start at" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Duration (min)" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input className="border rounded px-2 py-1" placeholder="Attendees emails (comma)" value={form.attendees} onChange={(e) => setForm({ ...form, attendees: e.target.value })} />
          </div>
          <textarea className="border rounded px-2 py-1" placeholder="Agenda" value={form.agenda} onChange={(e) => setForm({ ...form, agenda: e.target.value })} />
          <div>
            <button className="btn-primary" type="submit">Schedule</button>
          </div>
        </form>

        <div className="card">
          <div className="font-semibold mb-2">Upcoming meetings</div>
          <div className="space-y-2">
            {meetings.map((m) => (
              <div key={m.id} className="border rounded-xl p-3">
                <div className="font-medium">{m.title}</div>
                <div className="text-sm text-gray-600">{m.startAt ? new Date(m.startAt).toLocaleString() : 'TBD'} · {m.duration ? `${m.duration} min` : '—'}</div>
                {m.agenda && <div className="text-sm text-gray-700 mt-1">{m.agenda}</div>}
                {(m.attendees && m.attendees.length > 0) && <div className="text-xs text-gray-600 mt-1">Attendees: {m.attendees.join(', ')}</div>}
                {m.checkpointId && <div className="text-xs text-gray-600">Checkpoint #{m.checkpointId}</div>}
              </div>
            ))}
            {meetings.length === 0 && <div className="text-sm text-gray-600">No meetings scheduled.</div>}
          </div>
        </div>
      </div>
    </RequireRole>
  );
}


