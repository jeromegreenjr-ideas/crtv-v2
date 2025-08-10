import { z } from 'zod';
import { ProducerAssessmentSchema, ProducerAssessmentCategory, type ProducerAssessment } from './schemas';

export const ProducerAssessmentInput = z.object({
  links: z.array(z.string().url()).min(1)
});

function pseudoScore(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * 10) + 1; // 1..10
}

export async function assessProducer(input: z.infer<typeof ProducerAssessmentInput>): Promise<ProducerAssessment> {
  // Placeholder heuristic using deterministic pseudo-random values from link lengths
  const seed = input.links.join(',').length;
  const categories = ProducerAssessmentCategory.options;
  const scores: Record<string, { score: number; confidence: number; tips: string }> = {};
  let sum = 0;
  for (let i = 0; i < categories.length; i++) {
    const s = pseudoScore(seed + i);
    sum += s;
    scores[categories[i]] = {
      score: s,
      confidence: Math.min(1, 0.5 + (s / 20)),
      tips: 'Focus on consistent delivery and showcase recent work.'
    };
  }
  const avg = sum / categories.length;
  const tier = avg < 4 ? 'Beginner' : avg < 6.5 ? 'Intermediate' : avg < 8.5 ? 'Advanced' : 'Expert';
  const qualityEffort = Math.min(1, Math.max(0, (avg - 1) / 9));

  const output: ProducerAssessment = ProducerAssessmentSchema.parse({
    assessedAt: new Date().toISOString(),
    links: input.links,
    scores: scores as any,
    tier,
    qualityEffort,
  });
  return output;
}
