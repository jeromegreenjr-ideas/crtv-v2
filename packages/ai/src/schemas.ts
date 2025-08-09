import { z } from "zod";

export const BriefSchema = z.object({
  overview: z.string(),
  objectives: z.array(z.string()),
  audience: z.string().optional(),
  constraints: z.array(z.string()).optional(),
});

export const PhasePlanSchema = z.object({
  phases: z.array(z.object({
    phase: z.number().int().min(1).max(5),
    goals: z.array(z.string()),
  })).length(5)
});

export const CheckpointListSchema = z.object({
  checkpoints: z.array(z.object({
    phase: z.number().int().min(1).max(5),
    name: z.string(),
  }))
});

export const TaskListSchema = z.object({
  tasks: z.array(z.object({
    checkpointName: z.string(),
    title: z.string(),
    priority: z.number().int().min(1).max(3).default(2)
  }))
});
