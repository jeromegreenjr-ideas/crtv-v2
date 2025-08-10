import { NextResponse } from 'next/server';
import { getIdeaPublic } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const pack = await getIdeaPublic(idNum);
  return NextResponse.json({ idea: pack.idea, preview: pack.preview });
}


