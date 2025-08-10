import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '@crtv/db';

// Only create database connection if DATABASE_URL is available
let db: any = null;

if (process.env.DATABASE_URL) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  db = drizzle(pool, { schema });
} else {
  console.warn('DATABASE_URL not found, database features will be disabled');
}

export { db };
export type Database = typeof db;
