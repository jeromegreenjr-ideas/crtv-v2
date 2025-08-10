"use client";
import { useEventSource } from '../../hooks/useEventSource';
import { useEffect, useState } from 'react';

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


