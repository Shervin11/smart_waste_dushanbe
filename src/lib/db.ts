import { PrismaClient } from '@prisma/client';

const createMockPrismaClient = () => {
  console.log('Using in-memory mock database fallback for Vercel serverless SQLite.');

  const mockContainers = [
    { id: 'DUS-101', address: 'ул. Махсум, 12', latitude: 38.5612, longitude: 68.7345, fillLevel: 45, overflow: false, district: 'Sino', lastUpdated: new Date() },
    { id: 'DUS-102', address: 'ул. Гафурова, 45', latitude: 38.5732, longitude: 68.7512, fillLevel: 95, overflow: true, district: 'Sino', lastUpdated: new Date() },
    { id: 'DUS-103', address: 'ул. Айни, 84', latitude: 38.5521, longitude: 68.8012, fillLevel: 20, overflow: false, district: 'Shohmansur', lastUpdated: new Date() },
    { id: 'DUS-104', address: 'ул. Карамова, 12', latitude: 38.5889, longitude: 68.7845, fillLevel: 85, overflow: false, district: 'Ismoili Somoni', lastUpdated: new Date() },
    { id: 'DUS-105', address: 'ул. Джами, 8', latitude: 38.5312, longitude: 68.7612, fillLevel: 60, overflow: false, district: 'Firdavsi', lastUpdated: new Date() }
  ];

  const mockUsers = [
    { id: 'user-admin', username: 'admin', password: '123', name: 'Рустам Исмаилов', role: 'ADMIN' },
    { id: 'user-operator', username: 'operator', password: '123', name: 'Ситора Саидова', role: 'OPERATOR' },
    { id: 'user-driver-1', username: 'driver1', password: '123', name: 'Давлат Рахимов', role: 'DRIVER' },
    { id: 'user-driver-2', username: 'driver2', password: '123', name: 'Сомон Каримов', role: 'DRIVER' }
  ];

  const mockTasks = [
    { id: 'task-1', containerId: 'DUS-102', status: 'PENDING', priority: 'HIGH', createdAt: new Date(), completedAt: null, container: mockContainers[1], driverId: null, driver: null }
  ];

  return {
    user: {
      findUnique: async ({ where }: any) => mockUsers.find(u => u.username === where.username || u.id === where.id) || null,
      findMany: async () => mockUsers,
    },
    container: {
      findMany: async () => mockContainers,
      findUnique: async ({ where }: any) => mockContainers.find(c => c.id === where.id) || null,
      update: async ({ where, data }: any) => {
        const c = mockContainers.find(c => c.id === where.id);
        if (c) {
          if (data.fillLevel !== undefined) c.fillLevel = data.fillLevel;
          if (data.overflow !== undefined) c.overflow = data.overflow;
          c.lastUpdated = new Date();
          return c;
        }
        return null;
      }
    },
    task: {
      findMany: async ({ include }: any) => {
        return mockTasks.map(t => ({
          ...t,
          container: mockContainers.find(c => c.id === t.containerId) || t.container,
          driver: mockUsers.find(u => u.id === t.driverId) || null
        }));
      },
      findUnique: async ({ where }: any) => mockTasks.find(t => t.id === where.id) || null,
      findFirst: async ({ where }: any) => mockTasks.find(t => t.containerId === where.containerId && ['PENDING', 'IN_PROGRESS'].includes(t.status)) || null,
      create: async ({ data }: any) => {
        const newTask = {
          id: `task-${Date.now()}`,
          containerId: data.containerId,
          status: data.status || 'PENDING',
          priority: data.priority || 'MEDIUM',
          createdAt: new Date(),
          completedAt: null,
          container: mockContainers.find(c => c.id === data.containerId)!,
          driverId: data.driverId || null,
          driver: null
        };
        mockTasks.push(newTask);
        return newTask;
      },
      update: async ({ where, data, include }: any) => {
        const t = mockTasks.find(t => t.id === where.id);
        if (t) {
          if (data.status !== undefined) t.status = data.status;
          if (data.driverId !== undefined) t.driverId = data.driverId;
          if (data.completedAt !== undefined) t.completedAt = data.completedAt;
          return {
            ...t,
            container: mockContainers.find(c => c.id === t.containerId)!,
            driver: mockUsers.find(u => u.id === t.driverId) || null
          };
        }
        return null;
      }
    }
  } as any;
};

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

  // If on Vercel and no Postgres config is found, use the in-memory mock client
  // to prevent Serverless startup crashes with better-sqlite3 native bindings.
  if (process.env.VERCEL === '1') {
    return createMockPrismaClient() as unknown as PrismaClient;
  }

  // SQLite (Local Dev)
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const BetterSqlite3 = require('better-sqlite3');
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
