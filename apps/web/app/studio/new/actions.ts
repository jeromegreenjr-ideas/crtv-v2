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
  getProjectsByIdea, addProjects, addCheckpoints, addTasks
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
      aiMeta: { idempotencyKey, plan: planValidated },
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

    // Create 5 projects (phases 1..5)
    const newProjects = await addProjects([1,2,3,4,5].map(phase => ({
      id: undefined,
      ideaId,
      phase,
      status: 'in_progress',
      progress: 0,
    })));

    // Create one checkpoint per project for demo
    const newCheckpoints = await addCheckpoints(newProjects.map((p: any) => ({
      id: undefined,
      projectId: p.id,
      name: `${p.phase}.1 Kickoff`,
      status: 'open',
    })));

    // Create some seed tasks for the first checkpoint
    const firstCheckpoint = newCheckpoints[0];
    const newTasks = await addTasks([
      { id: undefined, checkpointId: firstCheckpoint.id, title: 'Scaffold repository', status: 'todo', priority: 1 },
      { id: undefined, checkpointId: firstCheckpoint.id, title: 'Define design tokens', status: 'todo', priority: 2 },
      { id: undefined, checkpointId: firstCheckpoint.id, title: 'Board MVP', status: 'todo', priority: 2 },
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


