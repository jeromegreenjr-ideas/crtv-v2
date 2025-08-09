CREATE TABLE IF NOT EXISTS "briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"content" jsonb NOT NULL,
	"version" integer DEFAULT 1,
	"ai_meta" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "checkpoints" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"due" timestamp,
	"status" varchar(32) DEFAULT 'open'
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_type" varchar(64) NOT NULL,
	"entity_id" integer NOT NULL,
	"kind" varchar(64) NOT NULL,
	"data" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"checkpoint_id" integer NOT NULL,
	"from_user_id" integer NOT NULL,
	"quality" integer NOT NULL,
	"timeliness" integer NOT NULL,
	"collab" integer NOT NULL,
	"notes" varchar(2048)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ideas" (
	"id" serial PRIMARY KEY NOT NULL,
	"stakeholder_id" integer NOT NULL,
	"status" varchar(32) DEFAULT 'draft' NOT NULL,
	"summary" varchar(2048),
	"context" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"idea_id" integer NOT NULL,
	"phase" integer NOT NULL,
	"status" varchar(32) DEFAULT 'in_progress',
	"progress" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"checkpoint_id" integer NOT NULL,
	"assignee_id" integer,
	"title" varchar(255) NOT NULL,
	"status" varchar(32) DEFAULT 'todo',
	"priority" integer DEFAULT 2,
	"files" jsonb
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" varchar(32) NOT NULL,
	"level" integer DEFAULT 1,
	"profile" jsonb
);
