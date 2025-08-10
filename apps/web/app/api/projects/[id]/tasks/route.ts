import { NextResponse } from 'next/server';
import { getCheckpointsByProject, getTasksByCheckpoint, setTasksAssignee, createTask } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  if (!Number.isFinite(projectId)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const cps = await getCheckpointsByProject(projectId);
  const tasks = (await Promise.all(cps.map((cp: any) => getTasksByCheckpoint(cp.id)))).flat();
  return NextResponse.json({ tasks });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const projectId = Number(params.id);
  const body = await req.json();
  if (body?.action === 'assign_many') {
    const { taskIds, assigneeId } = body;
    await setTasksAssignee(taskIds || [], assigneeId ?? null);
    return NextResponse.json({ ok: true });
  }
  if (body?.action === 'create' && body?.checkpointId && body?.title) {
    const task = await createTask(body.checkpointId, body.title, body.priority ?? 2);
    return NextResponse.json({ task });
  }
  return NextResponse.json({ error: 'bad request' }, { status: 400 });
}


