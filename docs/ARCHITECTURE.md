# CRTV Studio — Architecture (v0)
North Star: streamline idea development → brief → 5-phase plan → checkpoints → tasks → shipped work.

## Structure
- apps/web: Next.js App Router UI (RSC), role-aware dashboards.
- packages/db: Drizzle + Neon Postgres, Zod types.
- packages/api: tRPC (or REST) routers, server actions adapters.
- packages/ai: Orchestrator + agents, JSON Schemas, prompts.

## Event Spine
`events(entityType, entityId, kind, data, createdAt)` powers the activity feed and notifications.
