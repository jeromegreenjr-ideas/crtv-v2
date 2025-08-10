import { getProject, getCheckpointsByProject, getTasksByCheckpoint, calcCheckpointPct, calcProjectPct } from '../../../lib/data';

export const dynamic = 'force-dynamic';

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const project = await getProject(projectId);
  if (!project) return <div className="p-6">Project not found</div>;
  const checkpoints = await getCheckpointsByProject(projectId);
  const projectPct = await calcProjectPct(projectId);
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Project #{project.id} · Phase {project.phase}</h1>
          <p className="text-gray-600">Idea {project.ideaId} · {project.status}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{projectPct}%</div>
          <div className="text-gray-600 text-sm">complete</div>
        </div>
      </header>

      <div className="space-y-4">
        {await Promise.all(checkpoints.map(async (cp: any) => {
          const tasks = await getTasksByCheckpoint(cp.id);
          const pct = calcCheckpointPct(tasks);
          return (
            <div key={cp.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold">{cp.name}</h2>
                <div className="text-sm text-gray-600">{pct}%</div>
              </div>
              <ul className="space-y-2">
                {tasks.map((t: any) => (
                  <li key={t.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div>
                      <div className="font-medium">{t.title}</div>
                      <div className="text-sm text-gray-600">{t.status}</div>
                    </div>
                    <div className="text-sm text-gray-600">P{t.priority ?? 2}</div>
                  </li>
                ))}
                {tasks.length === 0 && <div className="text-sm text-gray-600">No tasks yet.</div>}
              </ul>
            </div>
          );
        }))}
      </div>
    </div>
  );
}

export default function ProjectBoard({ params }: { params: { id: string } }) {
  return (
    <main style={{ padding: 24 }}>
      <h2>Project Board — {params.id}</h2>
      <p>Phases → Checkpoints → Tasks (drag & drop, real-time) — to be implemented in Cursor.</p>
      <ul>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Scaffold repo</li>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Design tokens</li>
        <li>Phase 1 ▸ Checkpoint 1.1 ▸ Task: Board MVP</li>
      </ul>
    </main>
  );
}
