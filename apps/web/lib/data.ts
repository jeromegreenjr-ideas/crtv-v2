import { db } from './db';
import { ideas, briefs, events, projects, checkpoints, tasks } from '@crtv/db';
import { eq } from 'drizzle-orm';

// In-memory storage for demo purposes (fallback)
const inMemoryIdeas: any[] = [];
const inMemoryBriefs: any[] = [];
const inMemoryEvents: any[] = [];
const inMemoryProjects: any[] = [];
const inMemoryCheckpoints: any[] = [];
const inMemoryTasks: any[] = [];
const inMemoryProducerLevels: any[] = [];
let ideaIdCounter = 1;
let briefIdCounter = 1;
let projectIdCounter = 1;
let checkpointIdCounter = 1;
let taskIdCounter = 1;

export async function getIdeaData(ideaId: number) {
  try {
    // Try to get from database first if available
    if (db) {
      const idea = await db.select().from(ideas).where(eq(ideas.id, ideaId)).limit(1);
      const brief = await db.select().from(briefs).where(eq(briefs.ideaId, ideaId)).limit(1);
      const ideaEvents = await db.select().from(events).where(eq(events.entityId, ideaId));
      
      if (idea.length > 0) {
        return { 
          idea: idea[0], 
          brief: brief[0] || null, 
          events: ideaEvents 
        };
      }
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }

  // Fallback to in-memory storage
  const idea = inMemoryIdeas.find(i => i.id === ideaId);
  const brief = inMemoryBriefs.find(b => b.ideaId === ideaId);
  const ideaEvents = inMemoryEvents.filter(e => e.entityId === ideaId);
  
  return { idea, brief, events: ideaEvents };
}

export async function addIdea(idea: any) {
  try {
    // Try to add to database first if available
    if (db) {
      const result = await db.insert(ideas).values(idea).returning();
      return result[0];
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  
  // Fallback to in-memory storage
  inMemoryIdeas.push(idea);
  return idea;
}

export async function addBrief(brief: any) {
  try {
    // Try to add to database first if available
    if (db) {
      const result = await db.insert(briefs).values(brief).returning();
      return result[0];
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  
  // Fallback to in-memory storage
  inMemoryBriefs.push(brief);
  return brief;
}

export async function addEvents(newEvents: any[]) {
  try {
    // Try to add to database first if available
    if (db) {
      const result = await db.insert(events).values(newEvents).returning();
      return result;
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  
  // Fallback to in-memory storage
  inMemoryEvents.push(...newEvents);
  return newEvents;
}

export function getNextIdeaId() {
  return ideaIdCounter++;
}

export function getNextBriefId() {
  return briefIdCounter++;
}

export function getNextEventId() {
  return inMemoryEvents.length + 1;
}

export function getNextProjectId() {
  return projectIdCounter++;
}

export function getNextCheckpointId() {
  return checkpointIdCounter++;
}

export function getNextTaskId() {
  return taskIdCounter++;
}

// Database helper functions
export async function getAllIdeas() {
  try {
    // Try to get from database first if available
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
    // Try to update database first if available
    if (db) {
      await db.update(ideas).set({ status }).where(eq(ideas.id, ideaId));
      return;
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  
  // Fallback to in-memory storage
  const idea = inMemoryIdeas.find(i => i.id === ideaId);
  if (idea) {
    idea.status = status;
  }
}

// Projects helpers
export async function getProjectsByIdea(ideaId: number) {
  try {
    if (db) {
      return await db.select().from(projects).where(eq(projects.ideaId, ideaId));
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  return inMemoryProjects.filter(p => p.ideaId === ideaId);
}

export async function addProjects(newProjects: any[]) {
  try {
    if (db) {
      return await db.insert(projects).values(newProjects).returning();
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  for (const p of newProjects) {
    if (!p.id) p.id = getNextProjectId();
    inMemoryProjects.push(p);
  }
  return newProjects;
}

export async function addCheckpoints(newCheckpoints: any[]) {
  try {
    if (db) {
      return await db.insert(checkpoints).values(newCheckpoints).returning();
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  for (const c of newCheckpoints) {
    if (!c.id) c.id = getNextCheckpointId();
    inMemoryCheckpoints.push(c);
  }
  return newCheckpoints;
}

export async function addTasks(newTasks: any[]) {
  try {
    if (db) {
      return await db.insert(tasks).values(newTasks).returning();
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  for (const t of newTasks) {
    if (!t.id) t.id = getNextTaskId();
    inMemoryTasks.push(t);
  }
  return newTasks;
}

export async function addProducerLevel(entry: { userId: number; tier: string; scores: any; qualityEffort: number; assessedAt?: Date }) {
  try {
    if (db) {
      // @ts-ignore drizzle types available at runtime only
      const result = await db.insert(producerLevels).values({
        userId: entry.userId,
        tier: entry.tier,
        scores: entry.scores,
        qualityEffort: Math.round((entry.qualityEffort || 0) * 100),
        assessedAt: entry.assessedAt ?? new Date(),
      }).returning();
      return result[0];
    }
  } catch (error) {
    console.warn('Database connection failed, using in-memory storage:', error);
  }
  const rec = { id: inMemoryProducerLevels.length + 1, ...entry, assessedAt: entry.assessedAt ?? new Date() };
  inMemoryProducerLevels.push(rec);
  return rec;
}
