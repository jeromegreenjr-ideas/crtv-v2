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

