import { getDb } from '@trace/db';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

export const db = getDb(process.env.DATABASE_URL);
