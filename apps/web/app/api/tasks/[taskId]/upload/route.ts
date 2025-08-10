import { NextResponse } from 'next/server';
import { saveUploads } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function POST(req: Request, { params }: { params: { taskId: string } }) {
  // For stub: accept JSON body with array of URLs, store as uploads linked to user with type taskAsset
  const id = Number(params.taskId);
  const body = await req.json();
  const userId = Number(body?.userId || 0) || 0;
  const files = (body?.files || []).slice(0, 5).map((url: string) => ({ url, type: 'taskAsset' }));
  if (!userId || files.length === 0) return NextResponse.json({ error: 'missing user/files' }, { status: 400 });
  const recs = await saveUploads(userId, files);
  return NextResponse.json({ uploads: recs, taskId: id });
}


