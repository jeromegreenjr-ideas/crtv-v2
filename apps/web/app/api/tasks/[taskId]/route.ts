import { NextResponse } from 'next/server';
import { updateTask } from '../../../../lib/data';
import { broadcast } from '../../../../lib/eventBus';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const id = Number(params.taskId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const body = await req.json();
  await updateTask(id, body || {});
  if (body?.status) broadcast('notifications', { kind: 'status.changed', data: { taskId: id, status: body.status }, createdAt: new Date() });
  if (typeof body?.assigneeId !== 'undefined') broadcast('notifications', { kind: 'task.assigned', data: { taskId: id, assigneeId: body.assigneeId }, createdAt: new Date() });
  return NextResponse.json({ ok: true });
}


