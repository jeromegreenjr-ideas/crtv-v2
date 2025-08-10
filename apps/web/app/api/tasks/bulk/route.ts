import { NextResponse } from 'next/server';
import { setTasksAssignee, deleteTasks } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json();
  if (body?.action === 'assign') {
    await setTasksAssignee(body.taskIds || [], body.assigneeId ?? null);
    return NextResponse.json({ ok: true });
  }
  if (body?.action === 'delete') {
    await deleteTasks(body.taskIds || []);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: 'bad request' }, { status: 400 });
}


