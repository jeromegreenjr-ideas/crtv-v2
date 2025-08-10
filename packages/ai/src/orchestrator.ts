import { BriefSchema, PhasePlanSchema, CheckpointListSchema, TaskListSchema, type Brief, type PhasePlan, type CheckpointList, type TaskList } from "./schemas";

export interface OrchestratorInput {
  summary: string;
  context?: Record<string, unknown>;
  idempotencyKey?: string;
}

export interface OrchestratorOutput {
  brief: Brief;
  plan: PhasePlan;
  checkpoints: CheckpointList;
  tasks: TaskList;
}

// Tool interfaces to be wired to GPT-5 Thinking with JSON schema enforcement later
export interface OrchestratorTools {
  getIdeaContext?: (summary: string, context?: Record<string, unknown>) => Promise<Record<string, unknown>>;
  createBrief?: (summary: string, context?: Record<string, unknown>) => Promise<Brief>;
  createPhasePlan?: (brief: Brief) => Promise<PhasePlan>;
  createCheckpoints?: (plan: PhasePlan) => Promise<CheckpointList>;
  createTasks?: (checkpoints: CheckpointList) => Promise<TaskList>;
  emitEvent?: (kind: string, data: unknown) => Promise<void> | void;
}

/**
 * Deterministic fallback implementation without external API calls.
 * Enforces Zod schemas strictly and guarantees JSON-only outputs.
 */
export async function orchestrateIdea(intake: OrchestratorInput, tools?: OrchestratorTools): Promise<OrchestratorOutput> {
  const ctx = tools?.getIdeaContext ? await tools.getIdeaContext(intake.summary, intake.context) : (intake.context ?? {});

  const brief = tools?.createBrief ? await tools.createBrief(intake.summary, ctx) : BriefSchema.parse({
    overview: intake.summary,
    objectives: ["Define MVP", "Assemble team", "Ship first milestone"],
    audience: typeof ctx["audience"] === 'string' ? String(ctx["audience"]) : undefined,
    constraints: Array.isArray(ctx["constraints"]) ? ctx["constraints"] as string[] : ["Budget", "Timeline"],
  });

  const plan = tools?.createPhasePlan ? await tools.createPhasePlan(brief) : PhasePlanSchema.parse({
    phases: [1,2,3,4,5].map(p => ({ phase: p, goals: [p === 1 ? 'Setup' : p === 2 ? 'Design' : p === 3 ? 'Build' : p === 4 ? 'Test' : 'Launch'] }))
  });

  const checkpoints = tools?.createCheckpoints ? await tools.createCheckpoints(plan) : CheckpointListSchema.parse({
    checkpoints: plan.phases.flatMap(p => ([
      { phase: p.phase, name: `${p.phase}.1 Kickoff` },
      { phase: p.phase, name: `${p.phase}.2 Review` },
      { phase: p.phase, name: `${p.phase}.3 Complete` },
    ]))
  });

  const tasks = tools?.createTasks ? await tools.createTasks(checkpoints) : TaskListSchema.parse({
    tasks: [
      { checkpointName: '1.1 Kickoff', title: 'Scaffold repository', priority: 1 },
      { checkpointName: '1.1 Kickoff', title: 'Define design tokens', priority: 2 },
      { checkpointName: '1.2 Review', title: 'Board MVP', priority: 2 },
    ]
  });

  tools?.emitEvent?.('orchestrator.completed', { idempotencyKey: intake.idempotencyKey });

  return { brief, plan, checkpoints, tasks };
}
