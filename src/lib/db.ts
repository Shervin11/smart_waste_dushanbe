import { PrismaClient } from '@prisma/client';

const createMockPrismaClient = () => {
  console.log('Using in-memory mock database fallback for Vercel serverless SQLite.');

  const mockContainers = [
    { id: 'DUS-101', address: 'ул. Нусратулло Махсум, 45', latitude: 38.564, longitude: 68.752, fillLevel: 45, overflow: false, district: 'Sino', lastUpdated: new Date() },
    { id: 'DUS-102', address: 'ул. Бободжон Гафуров, 12', latitude: 38.571, longitude: 68.765, fillLevel: 85, overflow: true, district: 'Sino', lastUpdated: new Date() },
    { id: 'DUS-103', address: 'пр. Рудаки, 84 (возле театра)', latitude: 38.586, longitude: 68.786, fillLevel: 20, overflow: false, district: 'Ismoili Somoni', lastUpdated: new Date() },
    { id: 'DUS-104', address: 'ул. Карамова, 15 (парк Хайям)', latitude: 38.591, longitude: 68.775, fillLevel: 95, overflow: true, district: 'Ismoili Somoni', lastUpdated: new Date() },
    { id: 'DUS-105', address: 'ул. Айни, 34', latitude: 38.552, longitude: 68.805, fillLevel: 60, overflow: false, district: 'Shohmansur', lastUpdated: new Date() },
    { id: 'DUS-106', address: 'ул. Дониш, 9 (Аэропорт)', latitude: 38.545, longitude: 68.815, fillLevel: 10, overflow: false, district: 'Shohmansur', lastUpdated: new Date() },
    { id: 'DUS-107', address: 'ул. Неъмат Карабаев, 65', latitude: 38.525, longitude: 68.778, fillLevel: 75, overflow: false, district: 'Firdavsi', lastUpdated: new Date() },
    { id: 'DUS-108', address: 'ул. Джами, 3', latitude: 38.515, longitude: 68.790, fillLevel: 92, overflow: true, district: 'Firdavsi', lastUpdated: new Date() }
  ];

  const mockUsers = [
    { id: 'user-admin', username: 'admin', password: 'admin123', name: 'Администратор Системы', role: 'ADMIN' },
    { id: 'user-operator', username: 'operator', password: 'operator123', name: 'Алишер (Оператор)', role: 'OPERATOR' },
    { id: 'user-driver-1', username: 'driver1', password: 'driver123', name: 'Сомон (Водитель)', role: 'DRIVER' },
    { id: 'user-driver-2', username: 'driver2', password: 'driver123', name: 'Джамшед (Водитель)', role: 'DRIVER' }
  ];

  const mockTasks = [
    { id: 'task-1', containerId: 'DUS-102', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: new Date(), completedAt: null, container: mockContainers[1], driverId: 'user-driver-1', driver: mockUsers[2] },
    { id: 'task-2', containerId: 'DUS-104', status: 'PENDING', priority: 'HIGH', createdAt: new Date(), completedAt: null, container: mockContainers[3], driverId: null, driver: null },
    { id: 'task-3', containerId: 'DUS-108', status: 'PENDING', priority: 'HIGH', createdAt: new Date(), completedAt: null, container: mockContainers[7], driverId: 'user-driver-2', driver: mockUsers[3] }
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
