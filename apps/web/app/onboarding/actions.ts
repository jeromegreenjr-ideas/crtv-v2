'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { broadcast } from '../../lib/eventBus';
import { orchestrateIdea, BriefSchema, PhasePlanSchema, CheckpointListSchema, TaskListSchema } from '../../../../packages/ai/src/index';
import { 
  upsertUserByEmail, addIdea, addBrief, addEvents,
  getNextIdeaId, getNextBriefId, getNextEventId,
} from '../../lib/data';

const StakeholderOnboardInput = z.object({
  email: z.string().email(),
  summary: z.string().min(1),
});

export async function onboardStakeholder(formData: FormData) {
  const parsed = StakeholderOnboardInput.safeParse({
    email: formData.get('email'),
    summary: formData.get('summary'),
  });
  if (!parsed.success) return { error: 'Invalid input' };
  const { email, summary } = parsed.data;

  const user = await upsertUserByEmail(email, 'stakeholder');

  const idempotencyKey = `idea-${Date.now()}-${Math.random().toString(36).slice(2,11)}`;
  const result = await orchestrateIdea({ summary, idempotencyKey });
  const briefValidated = BriefSchema.parse(result.brief);
  const planValidated = PhasePlanSchema.parse(result.plan);
  const checkpointsValidated = CheckpointListSchema.parse(result.checkpoints);
  const tasksValidated = TaskListSchema.parse(result.tasks);

  const idea = { id: getNextIdeaId(), stakeholderId: user.id, status: 'in_review', summary, createdAt: new Date() };
  await addIdea(idea);
  const brief = { id: getNextBriefId(), ideaId: idea.id, content: briefValidated, aiMeta: { idempotencyKey, plan: planValidated, checkpoints: checkpointsValidated, tasks: tasksValidated }, createdAt: new Date() };
  await addBrief(brief);
  await addEvents([
    { id: getNextEventId(), entityType: 'idea', entityId: idea.id, kind: 'idea.created', data: { summary }, createdAt: new Date() },
    { id: getNextEventId() + 1, entityType: 'brief', entityId: brief.id, kind: 'brief.generated', data: { idempotencyKey }, createdAt: new Date() },
  ]);
  broadcast(`idea-${idea.id}`, { kind: 'idea.created', data: { summary } });
  broadcast(`idea-${idea.id}`, { kind: 'brief.generated', data: { idempotencyKey } });
  revalidatePath('/ideas/[id]', 'page');
  return { success: true, ideaId: idea.id, requireSignUp: true };
}

const ProducerOnboardInput = z.object({
  email: z.string().email(),
  links: z.array(z.string().url()).min(1),
});

import { assessProducer } from '../../../../packages/ai/src/producerAssessment';
import { addProducerLevel } from '../../lib/data';

export async function onboardProducer(formData: FormData) {
  const email = String(formData.get('email') || '');
  const linksRaw = String(formData.get('links') || '');
  const links = linksRaw.split(/\s|,|\n/).map(s => s.trim()).filter(Boolean);
  const parsed = ProducerOnboardInput.safeParse({ email, links });
  if (!parsed.success) return { error: 'Invalid input' };

  const user = await upsertUserByEmail(email, 'producer');
  const assessment = await assessProducer({ links });
  await addProducerLevel({ userId: user.id, tier: assessment.tier, scores: assessment.scores as any, qualityEffort: Math.round(assessment.qualityEffort * 100) / 100 });
  return { success: true, userId: user.id, requireSignUp: true };
}


