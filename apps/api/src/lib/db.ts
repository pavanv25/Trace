import { getDb } from '@trace/db';

export const db = getDb(process.env.DATABASE_URL);
