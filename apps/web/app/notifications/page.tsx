"use client";
import { useEventSource } from '../../hooks/useEventSource';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [events, setEvents] = useState<any[]>([]);
  useEventSource('/api/events/notifications', (data) => {
    if (!data?.kind) return;
    setEvents((prev) => [{ ...data, id: Date.now() }, ...prev].slice(0, 50));
  });
  useEffect(() => {
    // seed
  }, []);
  const today = new Date().toDateString();
  const grouped = events.reduce((acc: any, e: any) => {
    const d = new Date(e.createdAt || Date.now()).toDateString();
    const key = d === today ? 'Today' : 'Earlier';
    acc[key] = acc[key] || [];
    acc[key].push(e);
    return acc;
  }, {} as Record<string, any[]>);
  const sections = ['Today','Earlier'].filter(k => grouped[k]?.length);
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {sections.length === 0 ? (
        <div className="card">No recent notifications.</div>
      ) : (
        sections.map((section) => (
          <div key={section} className="space-y-2">
            <div className="text-sm text-gray-600">{section}</div>
            {grouped[section].map((e: any) => (
              <div key={e.id} className="card">
                <div className="font-medium">{e.kind}</div>
                {e.data && <div className="text-sm text-gray-600">{JSON.stringify(e.data)}</div>}
                {e.data?.projectId && <Link className="text-blue-600 underline text-sm" href={`/projects/${e.data.projectId}`}>Open project</Link>}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}


