import { NextResponse } from 'next/server';
import { splitTask } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  const id = Number(params.taskId);
  if (!Number.isFinite(id)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const body = await req.json();
  const titles = Array.isArray(body?.titles) ? body.titles : [];
  const created = await splitTask(id, titles);
  return NextResponse.json({ created });
}


