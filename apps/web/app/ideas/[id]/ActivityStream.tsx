"use client";

import { useEffect, useState } from 'react';
import { useEventSource } from '@/hooks/useEventSource';
import ActivityList from './ActivityList';

interface EventItem {
  id: number;
  entityType: string;
  entityId: number;
  kind: string;
  data: any;
  createdAt: Date;
}

export default function ActivityStream({ ideaId, initialEvents }: { ideaId: number; initialEvents: EventItem[] }) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);

  useEventSource(`/api/events/idea-${ideaId}`, (data) => {
    if (!data || !data.kind) return;
    const event: EventItem = {
      id: Date.now(),
      entityType: 'idea',
      entityId: ideaId,
      kind: data.kind,
      data: data.data ?? {},
      createdAt: new Date(),
    };
    setEvents((prev) => [event, ...prev]);
  });

  useEffect(() => {
    setEvents(initialEvents || []);
  }, [ideaId]);

  return <ActivityList events={events} />;
}