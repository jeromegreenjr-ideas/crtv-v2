import { NextResponse } from 'next/server';
import { createMeeting, getMeetingsByCheckpoint, getMeetingsByProject } from '../../../lib/data';
import { broadcast } from '../../../lib/eventBus';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const checkpointId = Number(searchParams.get('checkpointId'));
  const projectId = Number(searchParams.get('projectId'));
  if (Number.isFinite(checkpointId)) {
    const rows = await getMeetingsByCheckpoint(checkpointId);
    return NextResponse.json({ meetings: rows });
  }
  if (Number.isFinite(projectId)) {
    const rows = await getMeetingsByProject(projectId);
    return NextResponse.json({ meetings: rows });
  }
  return NextResponse.json({ meetings: [] });
}

export async function POST(req: Request) {
  const body = await req.json();
  const rec = await createMeeting(body || {});
  broadcast('notifications', { kind: 'meeting.scheduled', data: { meetingId: rec.id, checkpointId: rec.checkpointId, projectId: rec.projectId, title: rec.title }, createdAt: new Date() });
  return NextResponse.json({ meeting: rec });
}


