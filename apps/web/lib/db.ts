import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Only create database connection if DATABASE_URL is available
let db: any = null;

if (process.env.DATABASE_URL) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql, { schema });
} else {
  console.warn('DATABASE_URL not found, database features will be disabled');
}

export { db };
export type Database = typeof db;
