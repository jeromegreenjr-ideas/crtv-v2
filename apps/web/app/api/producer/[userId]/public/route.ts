import { NextResponse } from 'next/server';
import { getLatestProducerAssessment, getProducerProfile } from '../../../../../lib/data';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: { userId: string } }) {
  const idNum = Number(params.userId);
  if (!Number.isFinite(idNum)) return NextResponse.json({ error: 'invalid id' }, { status: 400 });
  const assessment = await getLatestProducerAssessment(idNum);
  const profile = await getProducerProfile(idNum);
  // Only expose preview fields
  const preview = assessment ? {
    overallScore: assessment.overallScore,
    tier: assessment.tier,
    rubric: assessment.rubric,
  } : null;
  return NextResponse.json({ profile, preview });
}


