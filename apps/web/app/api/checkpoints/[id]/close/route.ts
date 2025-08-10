import { NextResponse } from 'next/server';
import { addEvents, getNextEventId, getEventsByEntity } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const checkpointId = Number(params.id);
  const events = await getEventsByEntity('checkpoint', checkpointId);
  const submittedBy = new Set(events.filter((e: any) => e.kind === 'checkpoint.review.submitted').map((e: any) => e.data?.reviewerRole));
  const required = ['director','pm','producer'];
  const missing = required.filter(r => !submittedBy.has(r));
  if (missing.length) return NextResponse.json({ error: 'reviews_missing', missing }, { status: 409 });
  const evt = { id: getNextEventId(), entityType: 'checkpoint', entityId: checkpointId, kind: 'checkpoint.closed', data: {}, createdAt: new Date() } as any;
  await addEvents([evt]);
  return NextResponse.json({ ok: true });
}


