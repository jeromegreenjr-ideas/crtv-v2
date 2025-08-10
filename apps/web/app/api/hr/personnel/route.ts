import { NextResponse } from 'next/server';
import { getProducers, getLatestProducerLevel, getTasksByAssignee, getEventsByEntity } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const producers = await getProducers();
  const rows = [] as any[];
  for (const p of producers as any[]) {
    const level = await getLatestProducerLevel(p.id);
    const tasks = await getTasksByAssignee(p.id);
    let done = 0, total = tasks.length;
    let comments = 0, changes = 0;
    for (const t of tasks as any[]) {
      const evts = await getEventsByEntity('task', t.id);
      comments += evts.filter((e: any) => e.kind === 'comment.added').length;
      changes += evts.filter((e: any) => e.kind === 'status.changed').length;
      if (t.status === 'done') done++;
    }
    const timeliness = total ? Math.round((done / total) * 100) : 0;
    const collaboration = Math.round(((comments / Math.max(1, changes)) * 100));
    const quality = level ? Math.min(100, Math.round((Number(level.qualityEffort || 50) + timeliness) / 2)) : Math.round((timeliness + collaboration) / 2);
    rows.push({ userId: p.id, email: p.email, tier: level?.tier || '—', timeliness, collaboration, quality });
  }
  return NextResponse.json({ personnel: rows });
}


