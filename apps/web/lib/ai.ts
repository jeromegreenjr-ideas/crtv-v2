import { orchestrateIdea, assessProducer } from '../../../packages/ai/src/index';
import { IdeaAssessmentSchema, ProducerAssessmentSchema } from '../../../packages/ai/src/schemas';
import { broadcast } from './eventBus';
import { 
  saveIdeaAssessment, createIdeaProfile, saveProducerAssessment, createOrUpdateProducerProfile, saveUploads
} from './data';

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

// New: high-level assessment flows with persistence and progress events
export async function assessIdea(params: {
  ideaId: number;
  title?: string;
  summary: string;
  market?: string;
  briefText?: string;
  briefFiles?: Array<{ url: string; size?: number; mime?: string }>;
}) {
  const topic = `assessment-idea-${params.ideaId}`;
  broadcast(topic, { step: 'start', pct: 0 });
  try {
    broadcast(topic, { step: 'ai', pct: 10 });
    const ai = await orchestrateIdea({ summary: params.summary, idempotencyKey: `idea-${params.ideaId}` });
    const phases = ai.plan?.phases?.length || 5;
    const tasksCount = ai.tasks?.tasks?.length || 0;
    const timeline = `${phases * 2}-${phases * 3} weeks`;
    const overallScore = ai.ideaAssessment ? 7.5 : 7.0; // placeholder if ideaAssessment missing
    const rubric = ai.ideaAssessment ? ai.ideaAssessment.scores : {
      criteria: [
        { key: 'marketPotential', label: 'Market Potential', weight: 0.25, score: 7.5, reason: 'Solid audience and demand' },
        { key: 'audienceFit', label: 'Audience Fit', weight: 0.2, score: 7.0, reason: 'Clear target user' },
        { key: 'differentiation', label: 'Differentiation', weight: 0.2, score: 6.8, reason: 'Novel approach' },
        { key: 'execution', label: 'Execution Complexity', weight: 0.15, score: 6.5, reason: 'Moderate scope' },
        { key: 'timeline', label: 'Timeline Feasibility', weight: 0.1, score: 7.8, reason: 'Achievable phases' },
        { key: 'risk', label: 'Risk Profile', weight: 0.1, score: 7.2, reason: 'Manageable risks' },
      ], total: overallScore, notes: ''
    };
    broadcast(topic, { step: 'persist', pct: 60 });
    const saved = await saveIdeaAssessment(params.ideaId, {
      overallScore: overallScore.toFixed(1),
      phases,
      estTimeline: timeline,
      tasksCount,
      rubric,
      preview: { overallScore: overallScore.toFixed(1), phases, tasksCount, estTimeline: timeline },
    });
    await createIdeaProfile(params.ideaId, {
      slug: `idea-${params.ideaId}`,
      title: params.title,
      overview: params.summary,
      metrics: { phases, tasksCount, timeline },
    });
    if (params.briefFiles?.length) await saveUploads(0, params.briefFiles.map(f => ({ ...f, type: 'ideaBrief' })));
    broadcast(topic, { step: 'done', pct: 100 });
    return { assessment: saved, preview: saved.preview };
  } catch (e) {
    broadcast(topic, { step: 'error', error: String((e as any)?.message || e) });
    throw e;
  }
}

export async function assessProducerFlow(params: {
  userId: number;
  bio?: string;
  experience?: string;
  category?: string;
  portfolioLinks?: string[];
  sampleFiles?: Array<{ url: string; size?: number; mime?: string }>;
}) {
  const topic = `assessment-producer-${params.userId}`;
  broadcast(topic, { step: 'start', pct: 0 });
  try {
    broadcast(topic, { step: 'ai', pct: 10 });
    const ai = await assessProducer({ links: params.portfolioLinks || [] });
    const overall = Object.values(ai.scores).reduce((acc: number, v: any, _, arr) => acc + (v.score || 0) / arr.length, 0);
    const categories: any = {};
    for (const [k, v] of Object.entries(ai.scores)) categories[k] = (v as any).score;
    broadcast(topic, { step: 'persist', pct: 60 });
    const saved = await saveProducerAssessment(params.userId, {
      overallScore: overall.toFixed(1), rubric: { criteria: Object.entries(ai.scores).map(([key, v]: any) => ({ key, label: key, weight: 1, score: v.score, reason: v.tips })) }, files: params.sampleFiles || [], categories
    });
    const slug = `u-${params.userId}`;
    await createOrUpdateProducerProfile(params.userId, {
      displayName: '', bio: params.bio, category: params.category, links: params.portfolioLinks || [], crtvTier: Math.round(overall), publicSlug: slug, isPublic: true
    });
    if (params.sampleFiles?.length) await saveUploads(params.userId, params.sampleFiles.map(f => ({ ...f, type: 'producerSample' })));
    broadcast(topic, { step: 'done', pct: 100 });
    return { assessment: saved, preview: { overallScore: saved.overallScore, categories } };
  } catch (e) {
    broadcast(topic, { step: 'error', error: String((e as any)?.message || e) });
    throw e;
  }
}


