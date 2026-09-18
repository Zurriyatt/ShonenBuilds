import "temporal-polyfill/full/global";
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json' with { type: 'json' };

const globalForPrisma = globalThis as unknown as { db?: any };

// Next.js will automatically look into your .env.local file for this
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is missing from your environment variables.");
}

// In Prisma 8, there are no driver adapters or connection engines to configure.
// The engine automatically adapts based on your connection URL string.
export const db =
  globalForPrisma.db ??
  postgres<Contract>({
    contractJson,
    url: connectionString,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.db = db; 
