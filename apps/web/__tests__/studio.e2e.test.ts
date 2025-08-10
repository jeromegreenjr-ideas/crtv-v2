import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateBriefAndPlan, approveBrief } from '../app/studio/new/actions';

// Mock the orchestrator used by actions
vi.mock('../../../../../packages/ai/src/index', async () => {
  const schemas = await import('../../../../../packages/ai/src/schemas');
  return {
    orchestrateIdea: vi.fn(),
    BriefSchema: schemas.BriefSchema,
    PhasePlanSchema: schemas.PhasePlanSchema,
    CheckpointListSchema: schemas.CheckpointListSchema,
    TaskListSchema: schemas.TaskListSchema,
  };
});

describe('Studio E2E', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should generate brief and plan successfully', async () => {
    const mockFormData = new FormData();
    mockFormData.append('summary', 'Test idea for a new project');

    // Mock orchestrator response
    const { orchestrateIdea } = await import('../../../../../packages/ai/src/index');
    (orchestrateIdea as any).mockResolvedValue({
      brief: {
        overview: 'Test overview',
        objectives: ['Objective 1', 'Objective 2'],
      },
      plan: {
        phases: [
          { phase: 1, goals: ['Setup'] },
          { phase: 2, goals: ['Design'] },
          { phase: 3, goals: ['Implement'] },
          { phase: 4, goals: ['Test'] },
          { phase: 5, goals: ['Deploy'] },
        ],
      },
      checkpoints: {
        checkpoints: [
          { phase: 1, name: 'Setup Complete' },
          { phase: 2, name: 'Design Review' },
          { phase: 3, name: 'MVP Ready' },
          { phase: 4, name: 'QA Complete' },
          { phase: 5, name: 'Production Deploy' },
        ],
      },
      tasks: {
        tasks: [
          { checkpointName: 'Setup Complete', title: 'Setup repo', priority: 1 },
          { checkpointName: 'Setup Complete', title: 'Configure CI/CD', priority: 2 },
        ],
      },
    });

    // Mock database operations
    const { db } = require('../../../../packages/db/src/client');
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue([]),
        }),
      }),
    });
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: 1 }]),
      }),
    });

    const result = await generateBriefAndPlan(mockFormData);

    expect(result.success).toBe(true);
    expect(result.ideaId).toBeDefined();
    expect(result.briefId).toBeDefined();
    expect(result.data.brief.overview).toBe('Test overview');
  });

  it('should approve brief and create projects/checkpoints/tasks', async () => {
    const ideaId = 1;

    const result = await approveBrief(ideaId);

    expect(result.success).toBe(true);
    expect(result.projectsCreated).toBeGreaterThanOrEqual(1);
    expect(result.checkpointsCreated).toBeGreaterThanOrEqual(1);
    expect(result.tasksCreated).toBeGreaterThanOrEqual(1);
  });

  it('should be idempotent - not create duplicates on repeated approval', async () => {
    const ideaId = 1;

    const result = await approveBrief(ideaId);

    expect(result.success).toBe(true);
    expect(result.message).toContain('already approved');
  });
});

