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
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      {events.length === 0 ? (
        <div className="card">No recent notifications.</div>
      ) : (
        <div className="space-y-3">
          {events.map((e) => (
            <div key={e.id} className="card">
              <div className="font-medium">{e.kind}</div>
              {e.data && <div className="text-sm text-gray-600">{JSON.stringify(e.data)}</div>}
              {e.data?.projectId && <Link className="text-blue-600 underline text-sm" href={`/projects/${e.data.projectId}`}>Open project</Link>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


