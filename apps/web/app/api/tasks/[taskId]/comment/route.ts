import { NextResponse } from 'next/server';
import { addEvents, getNextEventId } from '../../../../../lib/data';
import { broadcast } from '../../../../../lib/eventBus';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const id = Number(params.taskId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const body = await req.json();
  const text = (body?.text || '').toString().slice(0, 1024);
  const event = {
    id: getNextEventId(),
    entityType: 'task',
    entityId: id,
    kind: 'comment.added',
    data: { text },
    createdAt: new Date(),
  } as any;
  await addEvents([event]);
  broadcast('notifications', { kind: 'comment.added', data: { taskId: id, text }, createdAt: new Date() });
  return NextResponse.json({ ok: true });
}


