// In-memory storage for demo purposes
const ideas: any[] = [];
const briefs: any[] = [];
const events: any[] = [];
let ideaIdCounter = 1;
let briefIdCounter = 1;

export function getIdeaData(ideaId: number) {
  const idea = ideas.find(i => i.id === ideaId);
  const brief = briefs.find(b => b.ideaId === ideaId);
  const ideaEvents = events.filter(e => e.entityId === ideaId);
  
  return { idea, brief, events: ideaEvents };
}

export function addIdea(idea: any) {
  ideas.push(idea);
}

export function addBrief(brief: any) {
  briefs.push(brief);
}

export function addEvents(newEvents: any[]) {
  events.push(...newEvents);
}

export function getNextIdeaId() {
  return ideaIdCounter++;
}

export function getNextBriefId() {
  return briefIdCounter++;
}

export function getNextEventId() {
  return events.length + 1;
}
