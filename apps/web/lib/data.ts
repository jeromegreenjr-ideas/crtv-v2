import { db } from './db';
import { ideas, briefs, events, projects, checkpoints, tasks } from '@crtv/db';
import { eq, and, inArray } from 'drizzle-orm';

// In-memory storage for demo purposes (fallback)
const inMemoryIdeas: any[] = [];
const inMemoryBriefs: any[] = [];
const inMemoryEvents: any[] = [];
const inMemoryProjects: any[] = [];
const inMemoryCheckpoints: any[] = [];
const inMemoryTasks: any[] = [];
let ideaIdCounter = 1;
let briefIdCounter = 1;

export async function getIdeaData(ideaId: number) {
  try {
    if (db) {
      const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId)).limit(1);
      const brief = await db.select().from(briefs).where(eq(briefs.ideaId, ideaId)).limit(1);
      const ideaEvents = await db.select().from(events).where(eq(events.entityId, ideaId));
      if (idea.length > 0) {
        return { idea: idea[0], brief: brief[0] || null, events: ideaEvents };
      }
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  const idea = inMemoryIdeas.find(i => i.id === ideaId);
  const brief = inMemoryBriefs.find(b => b.ideaId === ideaId);
  const ideaEvents = inMemoryEvents.filter(e => e.entityId === ideaId);
  return { idea, brief, events: ideaEvents };
}

export async function addIdea(idea: any) {
  try {
    if (db) {
      const result = await db.insert(ideas).values(idea).returning();
      return result[0];
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  inMemoryIdeas.push(idea);
  return idea;
}

export async function addBrief(brief: any) {
  try {
    if (db) {
      const result = await db.insert(briefs).values(brief).returning();
      return result[0];
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  inMemoryBriefs.push(brief);
  return brief;
}

export async function addEvents(newEvents: any[]) {
  try {
    if (db) {
      const result = await db.insert(events).values(newEvents).returning();
      return result;
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  inMemoryEvents.push(...newEvents);
  return newEvents;
}

export function getNextIdeaId() { return ideaIdCounter++; }
export function getNextBriefId() { return briefIdCounter++; }
export function getNextEventId() { return inMemoryEvents.length + 1; }

export async function getAllIdeas() {
  try {
    if (db) {
      return await db.select().from(ideas).orderBy(ideas.createdAt);
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  return inMemoryIdeas;
}

export async function updateIdeaStatus(ideaId: number, status: string) {
  try {
    if (db) {
      await db.update(ideas).set({ status }).where(eq(ideas.id, ideaId));
      return;
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  const idea = inMemoryIdeas.find(i => i.id === ideaId);
  if (idea) { idea.status = status; }
}

export async function createProjectsWithPlan(ideaId: number, plan: any, checkpointList: any, taskList: any) {
  try {
    if (db) {
      const createdProjects = await Promise.all(plan.phases.map(async (p: any) => {
        const [proj] = await db.insert(projects).values({ ideaId, phase: p.phase }).returning();
        const cps = checkpointList.checkpoints.filter((c: any) => c.phase === p.phase);
        const createdCps = await Promise.all(cps.map(async (c: any) => {
          const [cp] = await db.insert(checkpoints).values({ projectId: proj.id, name: c.name }).returning();
          return cp;
        }));
        for (const cp of createdCps) {
          const phasePrefix = String(p.phase) + '.';
          const relatedTasks = taskList.tasks.filter((t: any) => t.checkpointName.startsWith(phasePrefix));
          if (relatedTasks.length > 0) {
            await db.insert(tasks).values(relatedTasks.map((t: any) => ({ checkpointId: cp.id, title: t.title, priority: t.priority })));
          }
        }
        return proj;
      }));
      return createdProjects;
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  for (const p of plan.phases) {
    const proj = { id: inMemoryProjects.length + 1, ideaId, phase: p.phase, status: 'in_progress', progress: 0 };
    inMemoryProjects.push(proj);
    const cps = checkpointList.checkpoints.filter((c: any) => c.phase === p.phase);
    for (const c of cps) {
      const cp = { id: inMemoryCheckpoints.length + 1, projectId: proj.id, name: c.name, status: 'open' };
      inMemoryCheckpoints.push(cp);
      const phasePrefix = String(p.phase) + '.';
      const relatedTasks = taskList.tasks.filter((t: any) => t.checkpointName.startsWith(phasePrefix));
      for (const t of relatedTasks) {
        inMemoryTasks.push({ id: inMemoryTasks.length + 1, checkpointId: cp.id, title: t.title, priority: t.priority, status: 'todo' });
      }
    }
  }
}

export async function getIdeaProgress(ideaId: number) {
  try {
    if (db) {
      const projs = await db.select().from(projects).where(eq(projects.ideaId, ideaId));
      if (projs.length === 0) return 0;
      const cps = await db.select().from(checkpoints).where(inArray(checkpoints.projectId, projs.map(p => p.id)));
      const tsks = await db.select().from(tasks).where(inArray(tasks.checkpointId, cps.map(c => c.id)));
      const total = tsks.length || 1;
      const done = tsks.filter(t => t.status === 'done').length;
      return Math.round((done / total) * 100);
    }
  } catch {}
  const projs = inMemoryProjects.filter(p => p.ideaId === ideaId);
  if (projs.length === 0) return 0;
  const cps = inMemoryCheckpoints.filter(c => projs.some(p => p.id === c.projectId));
  const tsks = inMemoryTasks.filter(t => cps.some(c => c.id === t.checkpointId));
  const total = tsks.length || 1;
  const done = tsks.filter(t => t.status === 'done').length;
  return Math.round((done / total) * 100);
}
