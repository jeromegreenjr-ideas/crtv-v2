import { NextResponse } from 'next/server';
import { addEvents, getNextEventId } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

// POST: submit a checkpoint review { checkpointId, reviewerRole: 'director'|'pm'|'producer', scores: { quality, timeliness, collaboration }, comment }
export async function POST(req: Request) {
  const body = await req.json();
  const { checkpointId, reviewerRole, scores, comment } = body || {};
  if (!checkpointId || !reviewerRole || !scores) return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  const evt = {
    id: getNextEventId(),
    entityType: 'checkpoint',
    entityId: Number(checkpointId),
    kind: 'checkpoint.review.submitted',
    data: { reviewerRole, scores, comment },
    createdAt: new Date(),
  } as any;
  await addEvents([evt]);
  return NextResponse.json({ ok: true });
}

// GET: review status by checkpoint
export async function GET(req: Request) {
  // Note: without DB, we cannot query events by type efficiently; client can fetch events SSE per checkpoint
  return NextResponse.json({ note: 'Use events stream to determine which roles submitted reviews.' });
}


