import { getProject, getCheckpointsByProject, getTasksByCheckpoint, calcCheckpointPct, calcProjectPct } from '../../../lib/data';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import dynamic from 'next/dynamic';
const BulkOps = dynamic(() => import('./bulk-ops'), { ssr: false });
const KanbanClient = dynamic(() => import('./kanban-client'), { ssr: false });
import { revalidatePath } from 'next/cache';
import ProgressBar from '../../../components/ProgressBar';
import { updateCheckpoint, createTask, setTasksAssignee, shiftCheckpointDue, moveCheckpoint } from '../../../lib/data';
import RequireRole from '../../../components/RequireRole';

export const dynamic = 'force-dynamic';

export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const project = await getProject(projectId);
  if (!project) return <div className="p-6">Project not found</div>;
  const checkpoints = await getCheckpointsByProject(projectId);
  const projectPct = await calcProjectPct(projectId);
  return (
    <RequireRole allow={["stakeholder","director","pm","producer","hr"]}>
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/projects" className="text-gray-600 hover:text-primary-600 inline-flex items-center"><ArrowLeft className="w-4 h-4 mr-1"/>Back</Link>
          <div>
            <h1 className="text-2xl font-semibold">Project #{project.id} · Phase {project.phase}</h1>
            <p className="text-gray-600">Idea {project.ideaId} · {project.status}</p>
          </div>
        </div>
        <div className="text-right w-48">
          <div className="text-xs text-gray-600 mb-1">{projectPct}% complete</div>
          <ProgressBar value={projectPct} label={`Project ${project.id} completion`} />
        </div>
      </header>

      <div className="space-y-4">
        {await Promise.all(checkpoints.map(async (cp: any) => {
          const tasks = await getTasksByCheckpoint(cp.id);
          const pct = calcCheckpointPct(tasks);
          return (
            <div key={cp.id} className="card">
              <div className="flex items-center justify-between mb-3">
                <form action={async (formData: FormData) => {
                  'use server';
                  const name = formData.get('name') as string;
                  const due = formData.get('due') ? new Date(formData.get('due') as string) : null;
                  await updateCheckpoint(cp.id, { name, due });
                  revalidatePath(`/projects/${projectId}`);
                }} className="flex items-center gap-2">
                  <input name="name" defaultValue={cp.name} className="border rounded px-2 py-1 text-sm" />
                  <input type="date" name="due" className="border rounded px-2 py-1 text-sm" />
                  <button className="btn-secondary text-xs" type="submit">Save</button>
                </form>
                <div className="flex items-center gap-2 w-48">
                  <form action={async () => { 'use server'; await shiftCheckpointDue(cp.id, 7); revalidatePath(`/projects/${projectId}`); }}>
                    <button type="submit" className="text-xs text-primary-600">+7d</button>
                  </form>
                  <div className="flex-1">
                    <ProgressBar value={pct} label={`Checkpoint ${cp.id} completion`} />
                  </div>
                </div>
              </div>
              <ul className="space-y-2">
                {tasks.map((t: any) => {
                  const statusMap: Record<string, string> = {
                    todo: 'bg-status-todo/15 text-status-todo',
                    in_progress: 'bg-status-progress/15 text-status-progress',
                    review: 'bg-status-review/15 text-status-review',
                    done: 'bg-status-success/15 text-status-success',
                    blocked: 'bg-status-danger/15 text-status-danger',
                  };
                  const badge = statusMap[t.status] || 'bg-gray-100 text-gray-700';
                  return (
                    <li key={t.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <div className="font-medium">{t.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${badge}`}>{t.status}</span>
                          <button className="text-xs text-primary-600 hover:underline" formAction={async () => {
                            'use server';
                            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/app/api/tasks/${t.id}`, { method: 'PATCH', body: JSON.stringify({ status: t.status === 'todo' ? 'in_progress' : 'done' }) } as any);
                          }}>Advance</button>
                          <button className="text-xs text-primary-600 hover:underline" formAction={async () => {
                            'use server';
                            const titles = t.title.includes(':') ? t.title.split(':').map((s: string) => s.trim()).filter(Boolean) : [t.title + ' A', t.title + ' B'];
                            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/app/api/tasks/${t.id}/split`, { method: 'POST', body: JSON.stringify({ titles }) } as any);
                            revalidatePath(`/projects/${projectId}`);
                          }}>Split</button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">P{t.priority ?? 2}</div>
                    </li>
                  );
                })}
                {tasks.length === 0 && <div className="text-sm text-gray-600">No tasks yet.</div>}
              </ul>
              <form action={async (formData: FormData) => {
                'use server';
                const title = formData.get('title') as string;
                if (!title) return;
                await createTask(cp.id, title);
                revalidatePath(`/projects/${projectId}`);
              }} className="mt-3 flex items-center gap-2">
                <input name="title" placeholder="New task title" className="border rounded px-2 py-1 text-sm flex-1" />
                <button className="btn-secondary text-xs" type="submit"><Plus className="w-3 h-3 mr-1"/>Add</button>
              </form>
            </div>
          );
        }))}
        <BulkOps projectId={projectId} />
        <div className="card">
          <div className="font-semibold mb-2">Kanban</div>
          <KanbanClient projectId={projectId} initialColumns={checkpoints.map((c: any) => ({ id: c.id, name: c.name }))} />
        </div>
      </div>
    </div>
    </RequireRole>
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
