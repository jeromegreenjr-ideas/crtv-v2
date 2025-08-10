'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { broadcast } from '../../../lib/eventBus';
// Import from workspace source to avoid workspace package resolution in test env
import { orchestrateIdea, BriefSchema, PhasePlanSchema, CheckpointListSchema, TaskListSchema } from '../../../../../packages/ai/src/index';

const GenerateBriefSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
});

import { 
  addIdea, addBrief, addEvents, getNextIdeaId, getNextBriefId, getNextEventId, updateIdeaStatus,
  getProjectsByIdea, addProjects, addCheckpoints, addTasks, getIdeaData
} from '../../../lib/data';

export async function generateBriefAndPlan(formData: FormData) {
  try {
    // Validate input
    const validatedFields = GenerateBriefSchema.safeParse({
      summary: formData.get('summary'),
    });

    if (!validatedFields.success) {
      return {
        error: 'Invalid input',
        details: validatedFields.error.flatten().fieldErrors,
      };
    }

    const { summary } = validatedFields.data;
    const idempotencyKey = `idea-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;

    // Create idea
    const idea = {
      id: getNextIdeaId(),
      stakeholderId: 1,
      status: 'in_review',
      summary,
      createdAt: new Date(),
    };
    await addIdea(idea);

    // Generate brief and plan via orchestrator with schema enforcement
    const orchestrationResult = await orchestrateIdea({ summary, idempotencyKey });
    // Validate outputs defensively
    const briefValidated = BriefSchema.parse(orchestrationResult.brief);
    const planValidated = PhasePlanSchema.parse(orchestrationResult.plan);
    const checkpointsValidated = CheckpointListSchema.parse(orchestrationResult.checkpoints);
    const tasksValidated = TaskListSchema.parse(orchestrationResult.tasks);

    // Store brief
    const brief = {
      id: getNextBriefId(),
      ideaId: idea.id,
      content: briefValidated,
      aiMeta: { idempotencyKey, plan: planValidated, checkpoints: checkpointsValidated, tasks: tasksValidated },
      createdAt: new Date(),
    };
    await addBrief(brief);

    // Create events
    const newEvents = [
      {
        id: getNextEventId(),
        entityType: 'idea',
        entityId: idea.id,
        kind: 'idea.created',
        data: { summary },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 1,
        entityType: 'brief',
        entityId: brief.id,
        kind: 'brief.generated',
        data: { idempotencyKey },
        createdAt: new Date(),
      }
    ];
    await addEvents(newEvents);

    // Broadcast live updates
    broadcast(`idea-${idea.id}`, { kind: 'idea.created', data: { summary } });
    broadcast(`idea-${idea.id}`, { kind: 'brief.generated', data: { idempotencyKey } });

    revalidatePath('/ideas/[id]', 'page');
    revalidatePath('/ideas', 'page');
    revalidatePath('/projects', 'page');

    return {
      success: true,
      ideaId: idea.id,
      briefId: brief.id,
      data: {
        idea,
        brief: briefValidated,
        plan: planValidated,
        checkpoints: checkpointsValidated,
        tasks: tasksValidated,
      },
    };
  } catch (error) {
    console.error('Error generating brief:', error);
    return {
      error: 'Failed to generate brief and plan',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function approveBrief(ideaId: number) {
  try {
    // Idempotency: if projects already exist for this idea, treat as approved
    const existingProjects = await getProjectsByIdea(ideaId);
    if (existingProjects.length > 0) {
      await updateIdeaStatus(ideaId, 'active');
      return {
        success: true,
        ideaId,
        message: 'Brief already approved; projects exist',
        projectsCreated: 0,
        checkpointsCreated: 0,
        tasksCreated: 0,
      };
    }

    // Fetch orchestrator outputs from the brief metadata
    const { brief } = await getIdeaData(ideaId);
    const plan = brief?.aiMeta?.plan as { phases: { phase: number; goals: string[] }[] } | undefined;
    const checkpoints = brief?.aiMeta?.checkpoints as { checkpoints: { phase: number; name: string }[] } | undefined;
    const tasks = brief?.aiMeta?.tasks as { tasks: { checkpointName: string; title: string; priority?: number }[] } | undefined;

    // Create projects from phases
    const phases = plan?.phases?.length ? plan.phases.map(p => p.phase) : [1,2,3,4,5];
    const newProjects = await addProjects(phases.map(phase => ({
      id: undefined,
      ideaId,
      phase,
      status: 'in_progress',
      progress: 0,
    })));

    // Create checkpoints from orchestrator output, mapped to their project ids
    const checkpointsInput = checkpoints?.checkpoints ?? newProjects.map((p: any) => ({ phase: p.phase, name: `${p.phase}.1 Kickoff` }));
    const projectIdByPhase = new Map<number, number>(newProjects.map((p: any) => [p.phase, p.id] as [number, number]));
    const newCheckpoints = await addCheckpoints(checkpointsInput.map(cp => ({
      id: undefined,
      projectId: projectIdByPhase.get(cp.phase)!,
      name: cp.name,
      status: 'open',
    })));

    // Create tasks mapped by checkpoint name if provided
    const tasksInput = tasks?.tasks ?? [];
    const checkpointIdByName = new Map<string, number>(newCheckpoints.map((c: any) => [c.name, c.id] as [string, number]));
    const mappedTasks = tasksInput
      .map(t => ({
        id: undefined,
        checkpointId: checkpointIdByName.get(t.checkpointName),
        title: t.title,
        status: 'todo',
        priority: Math.min(3, Math.max(1, t.priority ?? 2))
      }))
      .filter(t => !!t.checkpointId) as any[];
    const newTasks = await addTasks(mappedTasks.length ? mappedTasks : [
      { id: undefined, checkpointId: newCheckpoints[0].id, title: 'Scaffold repository', status: 'todo', priority: 1 },
      { id: undefined, checkpointId: newCheckpoints[0].id, title: 'Define design tokens', status: 'todo', priority: 2 },
      { id: undefined, checkpointId: newCheckpoints[0].id, title: 'Board MVP', status: 'todo', priority: 2 },
    ]);

    // Update idea status to active
    await updateIdeaStatus(ideaId, 'active');

    // Create events
    const newEvents = [
      {
        id: getNextEventId(),
        entityType: 'idea',
        entityId: ideaId,
        kind: 'brief.approved',
        data: { ideaId },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 1,
        entityType: 'idea',
        entityId: ideaId,
        kind: 'projects.created',
        data: { count: newProjects.length },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 2,
        entityType: 'idea',
        entityId: ideaId,
        kind: 'checkpoints.created',
        data: { count: newCheckpoints.length },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 3,
        entityType: 'idea',
        entityId: ideaId,
        kind: 'tasks.created',
        data: { count: newTasks.length },
        createdAt: new Date(),
      }
    ];
    await addEvents(newEvents);

    // Broadcast live updates
    broadcast(`idea-${ideaId}`, { kind: 'brief.approved', data: { ideaId } });
    broadcast(`idea-${ideaId}`, { kind: 'projects.created', data: { count: newProjects.length } });
    broadcast(`idea-${ideaId}`, { kind: 'checkpoints.created', data: { count: newCheckpoints.length } });
    broadcast(`idea-${ideaId}`, { kind: 'tasks.created', data: { count: newTasks.length } });

    revalidatePath('/ideas/[id]', 'page');
    revalidatePath('/ideas', 'page');
    revalidatePath('/projects', 'page');

    return {
      success: true,
      ideaId,
      projectsCreated: newProjects.length,
      checkpointsCreated: newCheckpoints.length,
      tasksCreated: newTasks.length,
    };
  } catch (error) {
    console.error('Error approving brief:', error);
    return {
      error: 'Failed to approve brief',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


