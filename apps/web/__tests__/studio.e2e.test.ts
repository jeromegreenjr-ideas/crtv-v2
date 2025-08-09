import { describe, it, expect } from 'vitest';
import { generateBriefAndPlan, approveBrief } from '../app/studio/new/actions';

// Mock the database and orchestrator for testing
jest.mock('../../../../packages/db/src/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    fn: {
      count: jest.fn(),
    },
  },
}));

jest.mock('../../../../packages/ai/src/orchestrator', () => ({
  orchestrateIdea: jest.fn(),
}));

describe('Studio E2E', () => {
  it('should generate brief and plan successfully', async () => {
    const mockFormData = new FormData();
    mockFormData.append('summary', 'Test idea for a new project');

    // Mock orchestrator response
    const { orchestrateIdea } = require('../../../../packages/ai/src/orchestrator');
    orchestrateIdea.mockResolvedValue({
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

    // Mock database operations for approval
    const { db } = require('../../../../packages/db/src/client');
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]), // No existing projects
      }),
    });
    db.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          { id: 1, phase: 1 },
          { id: 2, phase: 2 },
          { id: 3, phase: 3 },
          { id: 4, phase: 4 },
          { id: 5, phase: 5 },
        ]),
      }),
    });
    db.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue({}),
      }),
    });

    const result = await approveBrief(ideaId);

    expect(result.success).toBe(true);
    expect(result.projectsCreated).toBe(5);
    expect(result.checkpointsCreated).toBe(5);
    expect(result.tasksCreated).toBe(3);
  });

  it('should be idempotent - not create duplicates on repeated approval', async () => {
    const ideaId = 1;

    // Mock existing projects
    const { db } = require('../../../../packages/db/src/client');
    db.select.mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([
          { id: 1, phase: 1 },
          { id: 2, phase: 2 },
        ]), // Existing projects
      }),
    });

    const result = await approveBrief(ideaId);

    expect(result.success).toBe(true);
    expect(result.message).toContain('already approved');
  });
});

