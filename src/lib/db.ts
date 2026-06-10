import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const isPostgres =
    process.env.DATABASE_URL?.startsWith('postgres://') ||
    process.env.DATABASE_URL?.startsWith('postgresql://');

  if (isPostgres) {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // SQLite (Local Dev & Vercel fallback)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const BetterSqlite3 = require('better-sqlite3');
  // Resolve path to prisma/dev.db which is committed to the repo
  const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 'prisma/dev.db';
  const db = new BetterSqlite3(dbPath);
  const adapter = new PrismaBetterSqlite3(db);
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
