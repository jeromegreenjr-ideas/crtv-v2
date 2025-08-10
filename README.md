# CRTV Studio - Setup

## Required environment variables

Create a `.env` at repo root or set in Vercel:

```
DATABASE_URL="postgresql://postgres:<your_supabase_db_password>@db.<project-ref>.supabase.co:5432/postgres"
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4o-mini" # or your GPT-5 Thinking model
SUPABASE_URL="https://<project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your_anon_key>"
```

## Database (Neon + Drizzle)

- Provision a Neon or Supabase Postgres DB and set `DATABASE_URL`.
- From repo root:

```
npx drizzle-kit push --config packages/db/drizzle.config.ts
```

This will apply the schema in `packages/db/src/schema.ts` to your database.

## AI Orchestrator & Producer Assessment

- Set `OPENAI_API_KEY`.
- The orchestrator and assessment services automatically use OpenAI with JSON schema enforcement when the key is present; otherwise they fall back to deterministic local heuristics for development.

# CRTV Studio

A Turborepo monorepo for streamlining idea development → brief → 5-phase plan → checkpoints → tasks → shipped work.

## Quick Start

1. **Install dependencies**
   ```bash
   pnpm i
   ```

2. **Set up environment**
   ```bash
   cp env.example .env
   # Edit .env with your DATABASE_URL and OPENAI_API_KEY
   ```

3. **Set up database**
   ```bash
   # Create a Neon Postgres database and get your connection string
   # Then run migrations
   pnpm --filter @crtv/db db:migrate
   ```

4. **Start development server**
   ```bash
   pnpm --filter web dev
   ```

5. **Visit the app**
   - Studio intake: http://localhost:3000/studio/new
   - Idea details: http://localhost:3000/ideas/[id]

## Project Structure

- `apps/web` - Next.js App Router UI
- `packages/ai` - AI orchestrator and schemas
- `packages/db` - Drizzle ORM and database schema
- `packages/api` - API layer (future)

## Development

- `pnpm --filter web dev` - Start web app
- `pnpm --filter @crtv/db db:generate` - Generate new migrations
- `pnpm --filter @crtv/db db:migrate` - Push schema changes
- `pnpm --filter @crtv/db db:studio` - Open Drizzle Studio

