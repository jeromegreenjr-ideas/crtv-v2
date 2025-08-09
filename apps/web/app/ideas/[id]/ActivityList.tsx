interface Event {
  id: number;
  entityType: string;
  entityId: number;
  kind: string;
  data: any;
  createdAt: Date;
}

interface ActivityListProps {
  events: Event[];
}

const eventKindDescriptions: Record<string, string> = {
  'idea.created': 'Idea created',
  'brief.generated': 'Brief generated',
  'brief.approved': 'Brief approved',
  'projects.created': 'Projects created',
  'checkpoints.created': 'Checkpoints created',
  'tasks.created': 'Tasks created',
};

export default function ActivityList({ events }: ActivityListProps) {
  if (events.length === 0) {
    return (
      <div style={{ 
        padding: 16, 
        backgroundColor: '#f8f9fa', 
        borderRadius: 8,
        textAlign: 'center',
        color: '#666'
      }}>
        No activity yet
      </div>
    );
  }

  // Sort events by creation date (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {sortedEvents.map((event) => (
        <div 
          key={event.id}
          style={{ 
            padding: 12, 
            backgroundColor: '#f8f9fa', 
            borderRadius: 6,
            borderLeft: '4px solid #0070f3'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 500 }}>
              {eventKindDescriptions[event.kind] || event.kind}
            </span>
            <span style={{ fontSize: '0.875rem', color: '#666' }}>
              {new Date(event.createdAt).toLocaleString()}
            </span>
          </div>
          {event.data && Object.keys(event.data).length > 0 && (
            <div style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>
              {event.data.count && `${event.data.count} items`}
              {event.data.summary && `"${event.data.summary}"`}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
