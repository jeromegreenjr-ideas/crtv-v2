'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { broadcast } from '../../../lib/eventBus';

// Simple mock orchestrator for deployment
async function mockOrchestrateIdea(summary: string) {
  return {
    brief: {
      overview: `AI-generated overview for: ${summary}`,
      objectives: ['Define project scope', 'Assemble team', 'Create timeline'],
      audience: 'Project stakeholders and team members',
      constraints: ['Budget considerations', 'Timeline requirements']
    },
    plan: {
      phases: [
        { phase: 1, goals: ['Project setup and planning'] },
        { phase: 2, goals: ['Design and architecture'] },
        { phase: 3, goals: ['Development and implementation'] },
        { phase: 4, goals: ['Testing and quality assurance'] },
        { phase: 5, goals: ['Deployment and launch'] }
      ]
    },
    checkpoints: {
      checkpoints: [
        { phase: 1, name: 'Project Setup Complete' },
        { phase: 2, name: 'Design Review' },
        { phase: 3, name: 'MVP Ready' },
        { phase: 4, name: 'QA Complete' },
        { phase: 5, name: 'Production Deploy' }
      ]
    },
    tasks: {
      tasks: [
        { checkpointName: 'Project Setup Complete', title: 'Setup repository', priority: 1 },
        { checkpointName: 'Project Setup Complete', title: 'Configure CI/CD', priority: 2 },
        { checkpointName: 'Project Setup Complete', title: 'Team onboarding', priority: 2 }
      ]
    }
  };
}

const GenerateBriefSchema = z.object({
  summary: z.string().min(1, 'Summary is required'),
});

import { addIdea, addBrief, addEvents, getNextIdeaId, getNextBriefId, getNextEventId, updateIdeaStatus } from '../../../lib/data';

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
    const idempotencyKey = `idea-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create idea
    const idea = {
      id: getNextIdeaId(),
      stakeholderId: 1,
      status: 'in_review',
      summary,
      createdAt: new Date(),
    };
    await addIdea(idea);

    // Generate brief and plan via orchestrator
    const orchestrationResult = await mockOrchestrateIdea(summary);

    // Store brief
    const brief = {
      id: getNextBriefId(),
      ideaId: idea.id,
      content: orchestrationResult.brief,
      aiMeta: { idempotencyKey },
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
        brief: orchestrationResult.brief,
        plan: orchestrationResult.plan,
        checkpoints: orchestrationResult.checkpoints,
        tasks: orchestrationResult.tasks,
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
        data: { count: 5 },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 2,
        entityType: 'idea',
        entityId: ideaId,
        kind: 'checkpoints.created',
        data: { count: 5 },
        createdAt: new Date(),
      },
      {
        id: getNextEventId() + 3,
        entityType: 'idea',
        entityId: ideaId,
        kind: 'tasks.created',
        data: { count: 3 },
        createdAt: new Date(),
      }
    ];
    await addEvents(newEvents);

    // Broadcast live updates
    broadcast(`idea-${ideaId}`, { kind: 'brief.approved', data: { ideaId } });
    broadcast(`idea-${ideaId}`, { kind: 'projects.created', data: { count: 5 } });
    broadcast(`idea-${ideaId}`, { kind: 'checkpoints.created', data: { count: 5 } });
    broadcast(`idea-${ideaId}`, { kind: 'tasks.created', data: { count: 3 } });

    revalidatePath('/ideas/[id]', 'page');
    revalidatePath('/ideas', 'page');
    revalidatePath('/projects', 'page');

    return {
      success: true,
      ideaId,
      projectsCreated: 5,
      checkpointsCreated: 5,
      tasksCreated: 3,
    };
  } catch (error) {
    console.error('Error approving brief:', error);
    return {
      error: 'Failed to approve brief',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}


