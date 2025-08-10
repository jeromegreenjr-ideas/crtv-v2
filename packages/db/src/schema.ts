import { pgTable, serial, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(), // stakeholder|director|pm|producer|hr
  level: integer("level").default(1),
  profile: jsonb("profile"),
});

export const ideas = pgTable("ideas", {
  id: serial("id").primaryKey(),
  stakeholderId: integer("stakeholder_id").notNull(),
  title: varchar("title", { length: 255 }),
  market: varchar("market", { length: 255 }),
  status: varchar("status", { length: 32 }).notNull().default("submitted"),
  summary: varchar("summary", { length: 2048 }),
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const briefs = pgTable("briefs", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull(),
  content: jsonb("content").notNull(),
  version: integer("version").default(1),
  aiMeta: jsonb("ai_meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull(),
  phase: integer("phase").notNull(), // 1..5
  status: varchar("status", { length: 32 }).default("in_progress"),
  progress: integer("progress").default(0),
});

export const checkpoints = pgTable("checkpoints", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  due: timestamp("due"),
  status: varchar("status", { length: 32 }).default("open"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  checkpointId: integer("checkpoint_id").notNull(),
  assigneeId: integer("assignee_id"),
  title: varchar("title", { length: 255 }).notNull(),
  status: varchar("status", { length: 32 }).default("todo"),
  priority: integer("priority").default(2),
  files: jsonb("files"),
});

export const producerLevels = pgTable("producer_levels", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tier: varchar("tier", { length: 32 }).notNull(),
  scores: jsonb("scores").notNull(),
  qualityEffort: integer("quality_effort").notNull().default(0),
  assessedAt: timestamp("assessed_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  checkpointId: integer("checkpoint_id").notNull(),
  fromUserId: integer("from_user_id").notNull(),
  quality: integer("quality").notNull(),        // 1-5
  timeliness: integer("timeliness").notNull(),  // 1-5
  collab: integer("collab").notNull(),          // 1-5
  notes: varchar("notes", { length: 2048 }),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: integer("entity_id").notNull(),
  kind: varchar("kind", { length: 64 }).notNull(),
  data: jsonb("data"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New: idea assessments (rubric + scores)
export const ideaAssessments = pgTable("idea_assessments", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull(),
  overallScore: varchar("overall_score", { length: 16 }), // store as string to avoid decimal typing issues
  phases: integer("phases"),
  estTimeline: varchar("est_timeline", { length: 255 }),
  tasksCount: integer("tasks_count"),
  rubric: jsonb("rubric"), // {criteria:[{key,label,weight,score,reason}], total, notes}
  preview: jsonb("preview"),
  assessedAt: timestamp("assessed_at").defaultNow(),
});

// New: media assets for uploads/links
export const mediaAssets = pgTable("media_assets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  ideaId: integer("idea_id"),
  kind: varchar("kind", { length: 32 }), // link|image|video|file
  url: varchar("url", { length: 2048 }),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New: public producer profiles
export const producerProfiles = pgTable("producer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  username: varchar("username", { length: 64 }).notNull(),
  displayName: varchar("display_name", { length: 128 }),
  bio: varchar("bio", { length: 1024 }),
  tier: varchar("tier", { length: 32 }),
  category: varchar("category", { length: 64 }),
  links: jsonb("links"),
  crtvTier: integer("crtv_tier"),
  publicSlug: varchar("public_slug", { length: 96 }),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// New: public idea profiles (shareable)
export const ideaProfiles = pgTable("idea_profiles", {
  id: serial("id").primaryKey(),
  ideaId: integer("idea_id").notNull(),
  slug: varchar("slug", { length: 96 }).notNull(),
  title: varchar("title", { length: 255 }),
  overview: varchar("overview", { length: 2048 }),
  metrics: jsonb("metrics"), // tasks/phases/timeline
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// New: producer assessments
export const producerAssessments = pgTable("producer_assessments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  overallScore: varchar("overall_score", { length: 16 }),
  rubric: jsonb("rubric"),
  files: jsonb("files"),
  categories: jsonb("categories"),
  createdAt: timestamp("created_at").defaultNow(),
});

// New: uploads registry
export const uploads = pgTable("uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  type: varchar("type", { length: 32 }),
  url: varchar("url", { length: 2048 }),
  size: integer("size"),
  mime: varchar("mime", { length: 128 }),
  createdAt: timestamp("created_at").defaultNow(),
});
