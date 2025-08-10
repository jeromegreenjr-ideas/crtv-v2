import { z } from 'zod';
import { ProducerAssessmentSchema, ProducerAssessmentCategory, type ProducerAssessment } from './schemas';
import type { ResponseFormatJSONSchema } from 'openai/resources/responses.mjs';
let openai: any = null;
try {
  if (process.env.OPENAI_API_KEY) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: OpenAI } = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch {
  // ignore
}

export const ProducerAssessmentInput = z.object({
  links: z.array(z.string().url()).min(1)
});

function pseudoScore(seed: number) {
  const x = Math.sin(seed) * 43758.5453;
  return Math.floor((x - Math.floor(x)) * 10) + 1; // 1..10
}

export async function assessProducer(input: z.infer<typeof ProducerAssessmentInput>): Promise<ProducerAssessment> {
  if (openai) {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const schema: ResponseFormatJSONSchema = {
      type: 'json_schema',
      json_schema: {
        name: 'ProducerAssessment',
        schema: {
          type: 'object',
          properties: {
            assessedAt: { type: 'string' },
            links: { type: 'array', items: { type: 'string' }, minItems: 1 },
            scores: {
              type: 'object',
              additionalProperties: false,
              properties: Object.fromEntries(ProducerAssessmentCategory.options.map(k => [k, {
                type: 'object',
                properties: {
                  score: { type: 'number', minimum: 1, maximum: 10 },
                  confidence: { type: 'number', minimum: 0, maximum: 1 },
                  tips: { type: 'string' }
                },
                required: ['score', 'confidence', 'tips'],
                additionalProperties: false
              }]))
            },
            tier: { type: 'string', enum: ['Beginner','Intermediate','Advanced','Expert'] },
            qualityEffort: { type: 'number', minimum: 0, maximum: 1 }
          },
          required: ['assessedAt','links','scores','tier','qualityEffort'],
          additionalProperties: false
        }
      }
    };
    const system = 'You are a senior evaluator of creative producers. Output only JSON per schema.';
    const user = `Assess producer capabilities from links: ${JSON.stringify(input.links)}`;
    const res = await openai.responses.create({ model, input: [{ role: 'system', content: system }, { role: 'user', content: user }], response_format: schema });
    const text = res.output[0]?.content?.[0]?.text?.value ?? '{}';
    return ProducerAssessmentSchema.parse(JSON.parse(text));
  }

  // Fallback heuristic when OPENAI_API_KEY not set
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
  return ProducerAssessmentSchema.parse({
    assessedAt: new Date().toISOString(),
    links: input.links,
    scores: scores as any,
    tier,
    qualityEffort,
  });
}
