import { describe, it, expect } from 'vitest';
import { BriefSchema, PhasePlanSchema, CheckpointListSchema, TaskListSchema } from '../src/schemas';

describe('AI Schemas', () => {
  describe('BriefSchema', () => {
    it('should validate a valid brief', () => {
      const validBrief = {
        overview: 'A comprehensive project management tool',
        objectives: ['Improve team collaboration', 'Track project progress'],
        audience: 'Project managers and teams',
        constraints: ['Budget limited to $50k', 'Must launch in Q1']
      };

      const result = BriefSchema.safeParse(validBrief);
      expect(result.success).toBe(true);
    });

    it('should fail with missing required fields', () => {
      const invalidBrief = {
        overview: 'A project tool'
        // Missing objectives
      };

      const result = BriefSchema.safeParse(invalidBrief);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['objectives']);
      }
    });

    it('should fail with wrong type for objectives', () => {
      const invalidBrief = {
        overview: 'A project tool',
        objectives: 'Not an array' // Should be array
      };

      const result = BriefSchema.safeParse(invalidBrief);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(1);
        expect(result.error.issues[0].path).toEqual(['objectives']);
      }
    });
  });

  describe('PhasePlanSchema', () => {
    it('should validate a valid phase plan', () => {
      const validPlan = {
        phases: [
          { phase: 1, goals: ['Setup project', 'Assemble team'] },
          { phase: 2, goals: ['Design architecture'] },
          { phase: 3, goals: ['Implement core features'] },
          { phase: 4, goals: ['Testing and refinement'] },
          { phase: 5, goals: ['Deploy and launch'] }
        ]
      };

      const result = PhasePlanSchema.safeParse(validPlan);
      expect(result.success).toBe(true);
    });

    it('should fail with wrong number of phases', () => {
      const invalidPlan = {
        phases: [
          { phase: 1, goals: ['Setup'] },
          { phase: 2, goals: ['Design'] }
          // Missing phases 3, 4, 5
        ]
      };

      const result = PhasePlanSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });

    it('should fail with invalid phase number', () => {
      const invalidPlan = {
        phases: [
          { phase: 0, goals: ['Setup'] }, // Phase 0 is invalid
          { phase: 2, goals: ['Design'] },
          { phase: 3, goals: ['Implement'] },
          { phase: 4, goals: ['Test'] },
          { phase: 5, goals: ['Deploy'] }
        ]
      };

      const result = PhasePlanSchema.safeParse(invalidPlan);
      expect(result.success).toBe(false);
    });
  });

  describe('CheckpointListSchema', () => {
    it('should validate valid checkpoints', () => {
      const validCheckpoints = {
        checkpoints: [
          { phase: 1, name: 'Project Setup Complete' },
          { phase: 2, name: 'Design Review' },
          { phase: 3, name: 'MVP Ready' },
          { phase: 4, name: 'QA Complete' },
          { phase: 5, name: 'Production Deploy' }
        ]
      };

      const result = CheckpointListSchema.safeParse(validCheckpoints);
      expect(result.success).toBe(true);
    });

    it('should fail with missing checkpoint name', () => {
      const invalidCheckpoints = {
        checkpoints: [
          { phase: 1 } // Missing name
        ]
      };

      const result = CheckpointListSchema.safeParse(invalidCheckpoints);
      expect(result.success).toBe(false);
    });
  });

  describe('TaskListSchema', () => {
    it('should validate valid tasks', () => {
      const validTasks = {
        tasks: [
          { checkpointName: 'Project Setup Complete', title: 'Setup repository', priority: 1 },
          { checkpointName: 'Project Setup Complete', title: 'Configure CI/CD', priority: 2 },
          { checkpointName: 'Design Review', title: 'Create wireframes', priority: 3 }
        ]
      };

      const result = TaskListSchema.safeParse(validTasks);
      expect(result.success).toBe(true);
    });

    it('should use default priority when not provided', () => {
      const tasksWithDefaultPriority = {
        tasks: [
          { checkpointName: 'Setup', title: 'Task without priority' }
        ]
      };

      const result = TaskListSchema.safeParse(tasksWithDefaultPriority);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tasks[0].priority).toBe(2); // Default value
      }
    });

    it('should fail with invalid priority', () => {
      const invalidTasks = {
        tasks: [
          { checkpointName: 'Setup', title: 'Task', priority: 5 } // Priority > 3
        ]
      };

      const result = TaskListSchema.safeParse(invalidTasks);
      expect(result.success).toBe(false);
    });
  });
});

