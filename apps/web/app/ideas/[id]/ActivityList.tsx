import { Clock, CheckCircle, FileText, Target, Users, Sparkles } from 'lucide-react';

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

const eventKindConfig: Record<string, { description: string; icon: any; color: string }> = {
  'idea.created': { 
    description: 'Idea created', 
    icon: Sparkles, 
    color: 'text-blue-600 bg-blue-100' 
  },
  'brief.generated': { 
    description: 'Brief generated', 
    icon: FileText, 
    color: 'text-green-600 bg-green-100' 
  },
  'brief.approved': { 
    description: 'Brief approved', 
    icon: CheckCircle, 
    color: 'text-purple-600 bg-purple-100' 
  },
  'projects.created': { 
    description: 'Projects created', 
    icon: Target, 
    color: 'text-orange-600 bg-orange-100' 
  },
  'checkpoints.created': { 
    description: 'Checkpoints created', 
    icon: Clock, 
    color: 'text-indigo-600 bg-indigo-100' 
  },
  'tasks.created': { 
    description: 'Tasks created', 
    icon: Users, 
    color: 'text-pink-600 bg-pink-100' 
  },
};

export default function ActivityList({ events }: ActivityListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Activity Yet</h3>
        <p className="text-gray-500">
          Activity will appear here as you work on your project.
        </p>
      </div>
    );
  }

  // Sort events by creation date (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedEvents.map((event, index) => {
        const config = eventKindConfig[event.kind] || { 
          description: event.kind, 
          icon: Clock, 
          color: 'text-gray-600 bg-gray-100' 
        };
        const IconComponent = config.icon;
        
        return (
          <div key={event.id} className="flex items-start space-x-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${config.color}`}>
                <IconComponent className="w-5 h-5" />
              </div>
              {index < sortedEvents.length - 1 && (
                <div className="w-0.5 h-8 bg-gray-200 mt-2"></div>
              )}
            </div>
            
            {/* Event content */}
            <div className="flex-1 min-w-0">
              <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900">
                      {config.description}
                    </h4>
                    {event.data && Object.keys(event.data).length > 0 && (
                      <div className="mt-1 text-sm text-gray-600">
                        {event.data.count && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                            {event.data.count} items
                          </span>
                        )}
                        {event.data.summary && (
                          <p className="mt-1 italic">"{event.data.summary}"</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <time className="text-xs text-gray-500">
                      {new Date(event.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
