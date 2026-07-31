import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL || '';

// Singleton connection pool for Next.js dev server to prevent hot-reload memory leaks and slow rendering
const globalForDb = globalThis as unknown as {
  postgresClient: postgres.Sql | undefined;
};

const client = globalForDb.postgresClient ?? (
  connectionString
    ? postgres(connectionString, {
        prepare: false,
        max: 3,
        connect_timeout: 5,
        idle_timeout: 20,
        max_lifetime: 60,
      })
    : postgres('postgres://placeholder:placeholder@localhost:5432/placeholder', {
        prepare: false,
        max: 1,
        connect_timeout: 1,
        idle_timeout: 1,
        max_lifetime: 1,
      })
);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.postgresClient = client;
}

export const db = drizzle(client, { schema });
export const sqlClient = client;
export const hasDatabaseConnection = Boolean(connectionString);
export * from './schema';
