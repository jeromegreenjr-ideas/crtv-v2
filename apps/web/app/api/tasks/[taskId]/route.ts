import { NextResponse } from 'next/server';
import { updateTask } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function PATCH(req: Request, { params }: { params: { taskId: string } }) {
  const id = Number(params.taskId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const body = await req.json();
  await updateTask(id, body || {});
  return NextResponse.json({ ok: true });
}


