# Deployment Guide

## Quick Deploy to Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set environment variables (DATABASE_URL, OPENAI_API_KEY)
   - Deploy

4. **Get your public URL** (e.g., https://your-app.vercel.app)

## Alternative: Deploy to Netlify

1. **Connect your GitHub repo to Netlify**
2. **Set build settings**:
   - Build command: `npm run build`
   - Publish directory: `apps/web/.next`
3. **Set environment variables** in Netlify dashboard
4. **Deploy**

## Environment Variables Required

Set these in your deployment platform:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
OPENAI_API_KEY="sk-..."
```

## Database Setup

For a quick trial, you can use:
- **Neon** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app

## Local Development

```bash
npm install
npm run dev
# Visit http://localhost:3000
```
