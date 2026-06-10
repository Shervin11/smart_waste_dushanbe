import { PrismaClient } from '@prisma/client';

// PERSISTENT MOCK DATABASE FOR VERCEL SERVERLESS ENVIRONMENT
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
  { id: 'task-1', containerId: 'DUS-102', status: 'IN_PROGRESS', priority: 'HIGH', createdAt: new Date(), completedAt: null, containerId_rel: 'DUS-102', driverId: 'user-driver-1' },
  { id: 'task-2', containerId: 'DUS-104', status: 'PENDING', priority: 'HIGH', createdAt: new Date(), completedAt: null, containerId_rel: 'DUS-104', driverId: null },
  { id: 'task-3', containerId: 'DUS-108', status: 'PENDING', priority: 'HIGH', createdAt: new Date(), completedAt: null, containerId_rel: 'DUS-108', driverId: 'user-driver-2' }
];

const mockFeedbacks = [
  { id: 'fb-1', name: 'Мадина', email: 'madina@example.com', message: 'На улице Борбад контейнеры очищают не вовремя. Пожалуйста, проверьте график.', reply: 'Спасибо за обращение. Мы скорректировали маршрут водителя.', status: 'REPLIED', createdAt: new Date() },
  { id: 'fb-2', name: 'Илхом', email: 'ilhom@example.com', message: 'Почему на карте не виден сектор Фирдавси подробно?', reply: null, status: 'PENDING', createdAt: new Date() }
];

const mockSuggestedLocations = [
  { id: 'sl-1', address: 'ул. Дехоти, 23 (возле магазина)', description: 'Большое скопление строительного мусора во дворе дома. Нужен новый бак.', photo: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%231e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2364748b" font-size="10">Фото свалки</text></svg>', latitude: 38.520, longitude: 68.770, status: 'PENDING', createdAt: new Date() }
];

const filterList = (list: Record<string, unknown>[], whereArgs: Record<string, unknown> | undefined) => {
  if (!whereArgs) return list;
  let result = [...list];
  const keys = Object.keys(whereArgs);
  for (const key of keys) {
    const val = whereArgs[key];
    if (val !== undefined) {
      if (typeof val === 'object' && val !== null) {
        // Handle nested fields if any, or standard prisma operations (like in/not/etc)
        const operations = val as Record<string, unknown>;
        if ('in' in operations) {
          result = result.filter(item => (operations.in as unknown[]).includes((item as Record<string, unknown>)[key]));
        } else if ('not' in operations) {
          result = result.filter(item => (item as Record<string, unknown>)[key] !== operations.not);
        }
      } else {
        result = result.filter(item => (item as Record<string, unknown>)[key] === val);
      }
    }
  }
  return result;
};

const createMockPrismaClient = (): PrismaClient => {
  console.log('Using persistent in-memory mock database fallback for Vercel serverless SQLite.');

  return {
    user: {
      findUnique: async ({ where }: { where: Record<string, string> }) => {
        return mockUsers.find(u => u.username === where.username || u.id === where.id) || null;
      },
      findMany: async (args?: { where?: Record<string, unknown> }) => {
        return filterList(mockUsers as Record<string, unknown>[], args?.where);
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const newUser = {
          id: `user-${Date.now()}`,
          username: data.username as string,
          password: data.password as string,
          name: data.name as string,
          role: (data.role as string) || 'CLIENT'
        };
        mockUsers.push(newUser as never);
        return newUser;
      }
    },
    container: {
      findMany: async (args?: { where?: Record<string, unknown> }) => {
        return filterList(mockContainers as Record<string, unknown>[], args?.where);
      },
      findUnique: async ({ where }: { where: Record<string, string> }) => {
        return mockContainers.find(c => c.id === where.id) || null;
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const newContainer = {
          id: data.id as string,
          address: data.address as string,
          latitude: data.latitude as number,
          longitude: data.longitude as number,
          fillLevel: (data.fillLevel as number) ?? 0,
          overflow: (data.overflow as boolean) ?? false,
          district: (data.district as string) || 'Sino',
          lastUpdated: new Date()
        };
        mockContainers.push(newContainer);
        return newContainer;
      },
      update: async ({ where, data }: { where: Record<string, string>; data: Record<string, unknown> }) => {
        const c = mockContainers.find(c => c.id === where.id);
        if (c) {
          if (data.fillLevel !== undefined) c.fillLevel = data.fillLevel as number;
          if (data.overflow !== undefined) c.overflow = data.overflow as boolean;
          c.lastUpdated = new Date();
          return c;
        }
        return null;
      }
    },
    task: {
      findMany: async (args?: { where?: Record<string, unknown> }) => {
        const list = filterList(mockTasks as Record<string, unknown>[], args?.where);
        return list.map((t: Record<string, unknown>) => ({
          ...t,
          container: mockContainers.find(c => c.id === (t as Record<string, unknown>).containerId) || null,
          driver: mockUsers.find(u => u.id === (t as Record<string, unknown>).driverId) || null
        }));
      },
      findUnique: async ({ where }: { where: Record<string, string> }) => {
        const t = mockTasks.find(t => t.id === where.id);
        if (!t) return null;
        return {
          ...t,
          container: mockContainers.find(c => c.id === t.containerId) || null,
          driver: mockUsers.find(u => u.id === t.driverId) || null
        };
      },
      findFirst: async ({ where }: { where: Record<string, unknown> }) => {
        const active = mockTasks.find(t => t.containerId === where.containerId && ['PENDING', 'IN_PROGRESS'].includes(t.status));
        if (!active) return null;
        return {
          ...active,
          container: mockContainers.find(c => c.id === active.containerId) || null,
          driver: mockUsers.find(u => u.id === active.driverId) || null
        };
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const newTask = {
          id: `task-${Date.now()}`,
          containerId: data.containerId as string,
          status: (data.status as string) || 'PENDING',
          priority: (data.priority as string) || 'MEDIUM',
          createdAt: new Date(),
          completedAt: null,
          containerId_rel: data.containerId as string,
          driverId: (data.driverId as string) || null
        };
        mockTasks.push(newTask as never);
        return {
          ...newTask,
          container: mockContainers.find(c => c.id === newTask.containerId) || null,
          driver: mockUsers.find(u => u.id === newTask.driverId) || null
        };
      },
      update: async ({ where, data }: { where: Record<string, string>; data: Record<string, unknown> }) => {
        const t = mockTasks.find(t => t.id === where.id);
        if (t) {
          if (data.status !== undefined) (t as unknown as { status: string }).status = data.status as string;
          if (data.driverId !== undefined) (t as unknown as { driverId: string }).driverId = data.driverId as string;
          if (data.completedAt !== undefined) (t as unknown as { completedAt: Date | null }).completedAt = data.completedAt as Date | null;
          return {
            ...t,
            container: mockContainers.find(c => c.id === t.containerId)!,
            driver: mockUsers.find(u => u.id === t.driverId) || null
          };
        }
        return null;
      }
    },
    feedback: {
      findMany: async (args?: { where?: Record<string, unknown> }) => {
        return filterList(mockFeedbacks as Record<string, unknown>[], args?.where).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.createdAt as Date) > (a.createdAt as Date) ? -1 : 1);
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const newFb = {
          id: `fb-${Date.now()}`,
          name: data.name as string,
          email: (data.email as string) || null,
          message: data.message as string,
          reply: null,
          status: 'PENDING',
          createdAt: new Date()
        };
        mockFeedbacks.push(newFb as never);
        return newFb;
      },
      update: async ({ where, data }: { where: Record<string, string>; data: Record<string, unknown> }) => {
        const fb = mockFeedbacks.find(f => f.id === where.id);
        if (fb) {
          if (data.reply !== undefined) fb.reply = data.reply as string;
          if (data.status !== undefined) fb.status = data.status as string;
          return fb;
        }
        return null;
      }
    },
    suggestedLocation: {
      findMany: async (args?: { where?: Record<string, unknown> }) => {
        // In the database suggestedLocation might be queried, we map mock data
        return filterList(mockSuggestedLocations as Record<string, unknown>[], args?.where).sort((a: Record<string, unknown>, b: Record<string, unknown>) => (b.createdAt as Date) > (a.createdAt as Date) ? -1 : 1);
      },
      create: async ({ data }: { data: Record<string, unknown> }) => {
        const newSl = {
          id: `sl-${Date.now()}`,
          address: data.address as string,
          description: data.description as string,
          photo: data.photo as string,
          latitude: data.latitude as number,
          longitude: data.longitude as number,
          status: 'PENDING',
          createdAt: new Date()
        };
        mockSuggestedLocations.push(newSl as never);
        return newSl;
      },
      update: async ({ where, data }: { where: Record<string, string>; data: Record<string, unknown> }) => {
        const sl = mockSuggestedLocations.find(s => s.id === where.id);
        if (sl) {
          if (data.status !== undefined) {
            sl.status = data.status as string;
            // IF APPROVED: Automatically inject a Container
            if (data.status === 'APPROVED') {
              const uniqueId = `DUS-${Math.floor(110 + Math.random() * 880)}`;
              const newContainer = {
                id: uniqueId,
                address: sl.address,
                latitude: sl.latitude,
                longitude: sl.longitude,
                fillLevel: 85, // set critical fill so it appears for clean task right away!
                overflow: true, // critical
                district: 'Sino', // Sino as default district
                lastUpdated: new Date()
              };
              mockContainers.push(newContainer);
            }
          }
          return sl;
        }
        return null;
      }
    }
  } as unknown as ReturnType<typeof prismaClientSingleton>;
};

const prismaClientSingleton = () => {
  const isPostgres =
    process.env.DATABASE_URL?.startsWith('postgres://') ||
    process.env.DATABASE_URL?.startsWith('postgresql://');

  if (isPostgres) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require('@prisma/adapter-pg');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
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
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  // eslint-disable-next-line @typescript-eslint/no-require-imports
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
