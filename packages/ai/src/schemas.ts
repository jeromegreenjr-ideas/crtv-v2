import { z } from "zod";

export const BriefSchema = z.object({
  overview: z.string().min(1),
  objectives: z.array(z.string()).min(1),
  audience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
});

export const PhasePlanSchema = z.object({
  phases: z.array(z.object({
    phase: z.number().int().min(1).max(5),
    goals: z.array(z.string()).min(1),
  })).length(5)
});

export const CheckpointListSchema = z.object({
  checkpoints: z.array(z.object({
    phase: z.number().int().min(1).max(5),
    name: z.string().min(1),
  }))
});

export const TaskListSchema = z.object({
  tasks: z.array(z.object({
    checkpointName: z.string().min(1),
    title: z.string().min(1),
    priority: z.number().int().min(1).max(3).default(2)
  }))
});

export const ProducerAssessmentCategory = z.enum([
  'ux', 'frontend', 'backend', 'design', 'video_editing', 'content', 'marketing', 'branding', 'ui', 'data', 'devops', 'pm', 'copywriting', 'research'
]);

export const ProducerAssessmentSchema = z.object({
  assessedAt: z.string(),
  links: z.array(z.string().url()).min(1),
  scores: z.record(ProducerAssessmentCategory, z.object({
    score: z.number().min(1).max(10),
    confidence: z.number().min(0).max(1),
    tips: z.string().min(1)
  })),
  tier: z.enum(['Beginner','Intermediate','Advanced','Expert']),
  qualityEffort: z.number().min(0).max(1),
});

export type Brief = z.infer<typeof BriefSchema>;
export type PhasePlan = z.infer<typeof PhasePlanSchema>;
export type CheckpointList = z.infer<typeof CheckpointListSchema>;
export type TaskList = z.infer<typeof TaskListSchema>;
export type ProducerAssessment = z.infer<typeof ProducerAssessmentSchema>;
