import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL || '';

// Disable prefetch as it is not supported for "Transaction" pool mode in Supabase / PgBouncer
// Use placeholder during static build evaluation if DATABASE_URL is not yet configured
const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : postgres('postgres://placeholder:placeholder@localhost:5432/placeholder', { prepare: false, max: 1 });

export const db = drizzle(client, { schema });
export * from './schema';
