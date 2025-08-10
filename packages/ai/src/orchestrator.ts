import { BriefSchema, PhasePlanSchema, CheckpointListSchema, TaskListSchema, type Brief, type PhasePlan, type CheckpointList, type TaskList } from "./schemas";
import type { ResponseFormatJSONSchema } from "openai/resources/responses.mjs";
let openai: any = null;
try {
  if (process.env.OPENAI_API_KEY) {
    // Lazy import to avoid bundling in environments where it's not needed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { default: OpenAI } = require("openai");
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch {
  // ignore if openai not available
}

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
  // If OpenAI is available and no tools provided, create default tools that enforce JSON via schema
  if (!tools && openai) {
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const jsonBriefSchema: ResponseFormatJSONSchema = {
      type: "json_schema",
      json_schema: {
        name: "Brief",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            overview: { type: "string" },
            objectives: { type: "array", items: { type: "string" }, minItems: 1 },
            audience: { type: "string" },
            constraints: { type: "array", items: { type: "string" } }
          },
          required: ["overview", "objectives"]
        }
      }
    };

    const jsonPhasePlanSchema: ResponseFormatJSONSchema = {
      type: "json_schema",
      json_schema: {
        name: "PhasePlan",
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            phases: {
              type: "array",
              minItems: 5,
              maxItems: 5,
              items: {
                type: "object",
                properties: {
                  phase: { type: "integer", minimum: 1, maximum: 5 },
                  goals: { type: "array", items: { type: "string" }, minItems: 1 }
                },
                required: ["phase", "goals"],
                additionalProperties: false
              }
            }
          },
          required: ["phases"]
        }
      }
    };

    const jsonCheckpointSchema: ResponseFormatJSONSchema = {
      type: "json_schema",
      json_schema: {
        name: "CheckpointList",
        schema: {
          type: "object",
          properties: {
            checkpoints: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  phase: { type: "integer", minimum: 1, maximum: 5 },
                  name: { type: "string" }
                },
                required: ["phase", "name"],
                additionalProperties: false
              }
            }
          },
          required: ["checkpoints"],
          additionalProperties: false
        }
      }
    };

    const jsonTaskSchema: ResponseFormatJSONSchema = {
      type: "json_schema",
      json_schema: {
        name: "TaskList",
        schema: {
          type: "object",
          properties: {
            tasks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  checkpointName: { type: "string" },
                  title: { type: "string" },
                  priority: { type: "integer", minimum: 1, maximum: 3 }
                },
                required: ["checkpointName", "title"],
                additionalProperties: false
              }
            }
          },
          required: ["tasks"],
          additionalProperties: false
        }
      }
    };

    tools = {
      async createBrief(summary, context) {
        const system = "You are an expert project architect. Output ONLY JSON matching the provided schema.";
        const input = `Summarize into a concise brief with objectives. Context: ${JSON.stringify(context ?? {})}. Summary: ${summary}`;
        const res = await openai.responses.create({ model, input: [{ role: "system", content: system }, { role: "user", content: input }], response_format: jsonBriefSchema });
        const text = res.output[0]?.content?.[0]?.text?.value ?? "{}";
        return BriefSchema.parse(JSON.parse(text));
      },
      async createPhasePlan(brief) {
        const system = "You are an expert project planner. Output ONLY JSON with exactly 5 phases.";
        const input = `Create a 5-phase plan with explicit goals from this brief: ${JSON.stringify(brief)}`;
        const res = await openai.responses.create({ model, input: [{ role: "system", content: system }, { role: "user", content: input }], response_format: jsonPhasePlanSchema });
        const text = res.output[0]?.content?.[0]?.text?.value ?? "{}";
        return PhasePlanSchema.parse(JSON.parse(text));
      },
      async createCheckpoints(plan) {
        const system = "You are an expert PM. Output ONLY JSON with 3-5 checkpoints per phase.";
        const input = `Create checkpoints per phase based on: ${JSON.stringify(plan)}`;
        const res = await openai.responses.create({ model, input: [{ role: "system", content: system }, { role: "user", content: input }], response_format: jsonCheckpointSchema });
        const text = res.output[0]?.content?.[0]?.text?.value ?? "{}";
        return CheckpointListSchema.parse(JSON.parse(text));
      },
      async createTasks(checkpoints) {
        const system = "You are a senior producer. Output ONLY JSON with seed tasks for early execution.";
        const input = `Generate seed tasks per checkpoint from: ${JSON.stringify(checkpoints)}`;
        const res = await openai.responses.create({ model, input: [{ role: "system", content: system }, { role: "user", content: input }], response_format: jsonTaskSchema });
        const text = res.output[0]?.content?.[0]?.text?.value ?? "{}";
        return TaskListSchema.parse(JSON.parse(text));
      },
    };
  }
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
