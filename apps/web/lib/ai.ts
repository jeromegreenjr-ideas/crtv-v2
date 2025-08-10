import { orchestrateIdea, assessProducer } from '../../../packages/ai/src/index';
import { IdeaAssessmentSchema, ProducerAssessmentSchema } from '../../../packages/ai/src/schemas';

export async function generateIdeaArtifacts(input: { summary: string; idempotencyKey?: string }) {
  const result = await orchestrateIdea({ summary: input.summary, idempotencyKey: input.idempotencyKey });
  // Validate defensively
  IdeaAssessmentSchema.optional().parse(result.ideaAssessment);
  return result;
}

export async function evaluateProducer(input: { links: string[] }) {
  const result = await assessProducer({ links: input.links });
  ProducerAssessmentSchema.parse(result);
  return result;
}


