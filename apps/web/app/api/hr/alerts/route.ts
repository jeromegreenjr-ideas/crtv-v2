import { NextResponse } from 'next/server';
import { getProjectsByIdea, getCheckpointsByProject, getTasksByCheckpoint, getEventsByEntity } from '../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Simple heuristics: iterate over checkpoints/tasks and derive alerts
  const alerts: any[] = [];
  // For MVP, scan all project ids from memory by looping a few ranges
  for (let projectId = 1; projectId <= 50; projectId++) {
    const cps = await getCheckpointsByProject(projectId).catch(() => []);
    if (!cps || cps.length === 0) continue;
    for (const cp of cps as any[]) {
      const ts = await getTasksByCheckpoint(cp.id);
      // Slow response: comment mention older than 24h without reply (approx using any comment events)
      const events = await getEventsByEntity('task', ts[0]?.id || 0);
      const lastComment = events.filter((e: any) => e.kind === 'comment.added').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
      if (lastComment) {
        const ageH = (Date.now() - new Date(lastComment.createdAt).getTime()) / (1000*60*60);
        if (ageH > 24) alerts.push({ type: 'slow_response', checkpointId: cp.id, projectId, sinceHours: Math.round(ageH) });
      }
      // Rework risk: reopen after done x3 (we approximate by counting status.changed to.done then back to in_progress)
      const statusEvents = events.filter((e: any) => e.kind === 'status.changed');
      const doneCount = statusEvents.filter((e: any) => e.data?.status === 'done').length;
      const reopenCount = statusEvents.filter((e: any) => e.data?.status === 'in_progress').length;
      if (doneCount >= 3 && reopenCount >= 3) alerts.push({ type: 'rework_risk', checkpointId: cp.id, projectId, doneCount, reopenCount });
      // Low collaboration: comment ratio < threshold (comments per status change)
      const comments = events.filter((e: any) => e.kind === 'comment.added').length;
      const changes = statusEvents.length || 1;
      if (comments / changes < 0.3 && (comments + changes) > 5) alerts.push({ type: 'low_collaboration', checkpointId: cp.id, projectId, ratio: Number((comments/changes).toFixed(2)) });
    }
  }
  return NextResponse.json({ alerts });
}


