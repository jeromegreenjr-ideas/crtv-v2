export const dynamic = 'force-dynamic';

export default async function CommunicationPage() {
  // Stub meetings grouped by project/checkpoint
  const meetings = [
    { projectId: 1, checkpoint: '1.2 Review', title: 'Weekly standup', time: 'Wed 10:00' },
    { projectId: 2, checkpoint: '2.1 Kickoff', title: 'Design kickoff', time: 'Fri 14:00' },
  ];
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Communication</h1>
      {meetings.map((m, i) => (
        <div key={i} className="card flex items-center justify-between">
          <div>
            <div className="font-medium">{m.title}</div>
            <div className="text-sm text-gray-600">Project {m.projectId} · {m.checkpoint}</div>
          </div>
          <div className="text-sm text-gray-600">{m.time}</div>
        </div>
      ))}
    </div>
  );
}


