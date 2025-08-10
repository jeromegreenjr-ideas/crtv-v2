import { NextRequest } from 'next/server';
import { assessProducer, ProducerAssessmentInput } from '@crtv/ai';
import { db } from '@/lib/db';
import { producerLevels } from '@crtv/db';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = ProducerAssessmentInput.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input' }, { status: 400 });
  }
  const result = await assessProducer(parsed.data);

  try {
    if (db) {
      await db.insert(producerLevels).values({
        userId: 1,
        tier: result.tier,
        scores: result.scores as any,
        qualityEffort: Math.round(result.qualityEffort * 100),
      });
    }
  } catch {}

  return Response.json(result);
}