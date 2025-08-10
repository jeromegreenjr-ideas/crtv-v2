import { db } from './db';
import { users, ideas, briefs, events, projects, checkpoints, tasks, producerLevels, ideaAssessments, producerAssessments, producerProfiles, uploads, ideaProfiles } from '@crtv/db';
import { eq } from 'drizzle-orm';

// In-memory storage for demo purposes (fallback)
const inMemoryIdeas: any[] = [];
const inMemoryBriefs: any[] = [];
const inMemoryEvents: any[] = [];
const inMemoryProjects: any[] = [];
const inMemoryCheckpoints: any[] = [];
const inMemoryTasks: any[] = [];
const inMemoryProducerLevels: any[] = [];
const inMemoryUsers: any[] = [];
let ideaIdCounter = 1;
let briefIdCounter = 1;
let projectIdCounter = 1;
let checkpointIdCounter = 1;
let taskIdCounter = 1;
let userIdCounter = 1;

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

export async function createIdea(input: { stakeholderId: number; title?: string; summary?: string; market?: string; context?: any }) {
  const record = { id: getNextIdeaId(), stakeholderId: input.stakeholderId, title: input.title, summary: input.summary, market: input.market, status: 'submitted', context: input.context, createdAt: new Date() };
  return addIdea(record);
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

export async function saveIdeaAssessment(ideaId: number, data: any) {
  try {
    if (db) {
      const res = await db.insert(ideaAssessments).values({ ideaId, ...data }).returning();
      return res[0];
    }
  } catch (e) {
    console.warn('DB saveIdeaAssessment failed; memory fallback', e);
  }
  const rec = { id: (inMemoryEvents.length + 1), ideaId, ...data, assessedAt: new Date() };
  inMemoryEvents.push({ id: getNextEventId(), entityType: 'idea', entityId: ideaId, kind: 'idea.assessed', data: {}, createdAt: new Date() });
  return rec;
}

export async function getIdeaWithAssessment(ideaId: number) {
  const base = await getIdeaData(ideaId);
  try {
    if (db) {
      const rows = await db.select().from(ideaAssessments).where(eq(ideaAssessments.ideaId, ideaId));
      return { ...base, assessment: rows[0] || null };
    }
  } catch (e) {
    // ignore
  }
  return { ...base, assessment: null };
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

// Users helpers
export async function getUserByEmail(email: string) {
  try {
    if (db) {
      const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      return rows[0] || null;
    }
  } catch (e) {
    console.warn('DB getUserByEmail failed; using memory', e);
  }
  return inMemoryUsers.find(u => u.email === email) || null;
}

export async function upsertUserByEmail(email: string, role: string) {
  try {
    if (db) {
      const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (existing.length > 0) return existing[0];
      const inserted = await db.insert(users).values({ email, role }).returning();
      return inserted[0];
    }
  } catch (e) {
    console.warn('DB upsertUserByEmail failed; using memory', e);
  }
  const existing = inMemoryUsers.find((u) => u.email === email);
  if (existing) return existing;
  const user = { id: userIdCounter++, email, role, createdAt: new Date() };
  inMemoryUsers.push(user);
  return user;
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

export async function saveProducerAssessment(userId: number, data: any) {
  try {
    if (db) {
      const res = await db.insert(producerAssessments).values({ userId, ...data }).returning();
      return res[0];
    }
  } catch (e) {
    console.warn('DB saveProducerAssessment failed; memory fallback', e);
  }
  return { id: Date.now(), userId, ...data, createdAt: new Date() };
}

export async function createOrUpdateProducerProfile(userId: number, data: any) {
  try {
    if (db) {
      const existing = await db.select().from(producerProfiles).where(eq(producerProfiles.userId, userId)).limit(1);
      if (existing.length) {
        // @ts-ignore
        await db.update(producerProfiles).set(data).where(eq(producerProfiles.userId, userId));
        return { ...existing[0], ...data };
      }
      const res = await db.insert(producerProfiles).values({ userId, ...data }).returning();
      return res[0];
    }
  } catch (e) {
    console.warn('DB createOrUpdateProducerProfile failed; memory fallback', e);
  }
  return { id: Date.now(), userId, ...data, createdAt: new Date() };
}

export async function getProducerProfile(userId: number) {
  try {
    if (db) {
      const rows = await db.select().from(producerProfiles).where(eq(producerProfiles.userId, userId)).limit(1);
      return rows[0] || null;
    }
  } catch (e) {
    console.warn('DB getProducerProfile failed; memory fallback', e);
  }
  return null;
}

export async function getProducerProfileBySlug(slug: string) {
  try {
    if (db) {
      const rows = await db.select().from(producerProfiles).where(eq(producerProfiles.publicSlug, slug)).limit(1);
      return rows[0] || null;
    }
  } catch (e) {
    console.warn('DB getProducerProfileBySlug failed; memory fallback', e);
  }
  return null;
}

export async function saveUploads(userId: number, files: Array<{ url: string; size?: number; mime?: string; type: string }>) {
  try {
    if (db) {
      const res = await db.insert(uploads).values(files.map(f => ({ userId, ...f }))).returning();
      return res;
    }
  } catch (e) {
    console.warn('DB saveUploads failed; memory fallback', e);
  }
  return files.map((f, idx) => ({ id: Date.now() + idx, userId, ...f, createdAt: new Date() }));
}

export async function createIdeaProfile(ideaId: number, data: any) {
  try {
    if (db) {
      const res = await db.insert(ideaProfiles).values({ ideaId, ...data }).returning();
      return res[0];
    }
  } catch (e) {
    console.warn('DB createIdeaProfile failed; memory fallback', e);
  }
  return { id: Date.now(), ideaId, ...data };
}

export async function getIdeaProfileByIdeaId(ideaId: number) {
  try {
    if (db) {
      const rows = await db.select().from(ideaProfiles).where(eq(ideaProfiles.ideaId, ideaId)).limit(1);
      return rows[0] || null;
    }
  } catch (e) {
    console.warn('DB getIdeaProfileByIdeaId failed; memory fallback', e);
  }
  return null;
}

export async function getLatestProducerAssessment(userId: number) {
  try {
    if (db) {
      const rows = await db.select().from(producerAssessments).where(eq(producerAssessments.userId, userId));
      return rows.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())[0] || null;
    }
  } catch (e) {
    console.warn('DB getLatestProducerAssessment failed; memory fallback', e);
  }
  return null;
}

export async function getUploadsByUser(userId: number, type?: string, limit = 12) {
  try {
    if (db) {
      // Drizzle Lite: no orderBy here; client can sort if needed
      let rows = await db.select().from(uploads).where(eq(uploads.userId, userId));
      if (type) rows = rows.filter((r: any) => r.type === type);
      rows.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      return rows.slice(0, limit);
    }
  } catch (e) {
    console.warn('DB getUploadsByUser failed; memory fallback', e);
  }
  return [];
}

export async function getIdeaPublic(ideaId: number) {
  const ideaPack = await getIdeaWithAssessment(ideaId);
  const profile = await getIdeaProfileByIdeaId(ideaId);
  const preview = ideaPack.assessment?.preview || profile?.metrics || null;
  return { idea: ideaPack.idea, preview, profile };
}

// Dashboard queries and rollups
export async function getIdeasByStakeholder(stakeholderId: number) {
  try {
    if (db) {
      return await db.select().from(ideas).where(eq(ideas.stakeholderId, stakeholderId));
    }
  } catch (e) {
    console.warn('DB getIdeasByStakeholder failed; using memory', e);
  }
  return inMemoryIdeas.filter(i => i.stakeholderId === stakeholderId);
}

export async function getCheckpointsByProject(projectId: number) {
  try {
    if (db) {
      return await db.select().from(checkpoints).where(eq(checkpoints.projectId, projectId));
    }
  } catch (e) {
    console.warn('DB getCheckpointsByProject failed; using memory', e);
  }
  return inMemoryCheckpoints.filter(c => c.projectId === projectId);
}

export async function getTasksByCheckpoint(checkpointId: number) {
  try {
    if (db) {
      return await db.select().from(tasks).where(eq(tasks.checkpointId, checkpointId));
    }
  } catch (e) {
    console.warn('DB getTasksByCheckpoint failed; using memory', e);
  }
  return inMemoryTasks.filter(t => t.checkpointId === checkpointId);
}

export async function computeIdeaProgress(ideaId: number) {
  const projs = await getProjectsByIdea(ideaId);
  if (projs.length === 0) return { projects: 0, checkpoints: 0, tasks: 0, completionPct: 0 };
  let totalTasks = 0;
  let doneTasks = 0;
  let totalCheckpoints = 0;
  let doneCheckpoints = 0;
  for (const p of projs as any[]) {
    const cps = await getCheckpointsByProject(p.id);
    totalCheckpoints += cps.length;
    for (const c of cps as any[]) {
      const ts = await getTasksByCheckpoint(c.id);
      totalTasks += ts.length;
      doneTasks += ts.filter((t: any) => t.status === 'done').length;
      if (ts.length > 0 && ts.every((t: any) => t.status === 'done')) doneCheckpoints++;
    }
  }
  const completionPct = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);
  return { projects: projs.length, checkpoints: totalCheckpoints, tasks: totalTasks, completionPct };
}

export async function getLatestProducerLevel(userId: number) {
  try {
    if (db) {
      const rows = await db.select().from(producerLevels).where(eq(producerLevels.userId, userId));
      return rows.sort((a: any, b: any) => new Date(b.assessedAt || 0).getTime() - new Date(a.assessedAt || 0).getTime())[0] || null;
    }
  } catch (e) {
    console.warn('DB getLatestProducerLevel failed; using memory', e);
  }
  const rows = inMemoryProducerLevels.filter((r) => r.userId === userId);
  rows.sort((a, b) => new Date(b.assessedAt).getTime() - new Date(a.assessedAt).getTime());
  return rows[0] || null;
}
