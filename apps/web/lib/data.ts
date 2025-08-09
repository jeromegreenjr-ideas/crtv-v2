import { db } from './db';
import { ideas, briefs, events, projects, checkpoints, tasks } from '@crtv/db';
import { eq } from 'drizzle-orm';

// In-memory storage for demo purposes (fallback)
const inMemoryIdeas: any[] = [];
const inMemoryBriefs: any[] = [];
const inMemoryEvents: any[] = [];
let ideaIdCounter = 1;
let briefIdCounter = 1;

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
