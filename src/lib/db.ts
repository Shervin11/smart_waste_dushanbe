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

const filterList = (list: any[], whereArgs: any) => {
  if (!whereArgs) return list;
  let result = [...list];
  const keys = Object.keys(whereArgs);
  for (const key of keys) {
    const val = whereArgs[key];
    if (val !== undefined) {
      if (typeof val === 'object' && val !== null) {
        // Handle nested fields if any, or standard prisma operations (like in/not/etc)
        if ('in' in val) {
          result = result.filter(item => val.in.includes(item[key]));
        } else if ('not' in val) {
          result = result.filter(item => item[key] !== val.not);
        }
      } else {
        result = result.filter(item => item[key] === val);
      }
    }
  }
  return result;
};

const createMockPrismaClient = () => {
  console.log('Using persistent in-memory mock database fallback for Vercel serverless SQLite.');

  return {
    user: {
      findUnique: async ({ where }: any) => {
        return mockUsers.find(u => u.username === where.username || u.id === where.id) || null;
      },
      findMany: async (args?: any) => {
        return filterList(mockUsers, args?.where);
      },
      create: async ({ data }: any) => {
        const newUser = {
          id: `user-${Date.now()}`,
          username: data.username,
          password: data.password,
          name: data.name,
          role: data.role || 'CLIENT'
        };
        mockUsers.push(newUser);
        return newUser;
      }
    },
    container: {
      findMany: async (args?: any) => {
        return filterList(mockContainers, args?.where);
      },
      findUnique: async ({ where }: any) => {
        return mockContainers.find(c => c.id === where.id) || null;
      },
      create: async ({ data }: any) => {
        const newContainer = {
          id: data.id,
          address: data.address,
          latitude: data.latitude,
          longitude: data.longitude,
          fillLevel: data.fillLevel ?? 0,
          overflow: data.overflow ?? false,
          district: data.district || 'Sino',
          lastUpdated: new Date()
        };
        mockContainers.push(newContainer);
        return newContainer;
      },
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
      findMany: async (args?: any) => {
        const list = filterList(mockTasks, args?.where);
        return list.map(t => ({
          ...t,
          container: mockContainers.find(c => c.id === t.containerId) || null,
          driver: mockUsers.find(u => u.id === t.driverId) || null
        }));
      },
      findUnique: async ({ where }: any) => {
        const t = mockTasks.find(t => t.id === where.id);
        if (!t) return null;
        return {
          ...t,
          container: mockContainers.find(c => c.id === t.containerId) || null,
          driver: mockUsers.find(u => u.id === t.driverId) || null
        };
      },
      findFirst: async ({ where }: any) => {
        const active = mockTasks.find(t => t.containerId === where.containerId && ['PENDING', 'IN_PROGRESS'].includes(t.status));
        if (!active) return null;
        return {
          ...active,
          container: mockContainers.find(c => c.id === active.containerId) || null,
          driver: mockUsers.find(u => u.id === active.driverId) || null
        };
      },
      create: async ({ data }: any) => {
        const newTask = {
          id: `task-${Date.now()}`,
          containerId: data.containerId,
          status: data.status || 'PENDING',
          priority: data.priority || 'MEDIUM',
          createdAt: new Date(),
          completedAt: null,
          containerId_rel: data.containerId,
          driverId: data.driverId || null
        };
        mockTasks.push(newTask);
        return {
          ...newTask,
          container: mockContainers.find(c => c.id === newTask.containerId) || null,
          driver: mockUsers.find(u => u.id === newTask.driverId) || null
        };
      },
      update: async ({ where, data }: any) => {
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
    },
    feedback: {
      findMany: async (args?: any) => {
        return filterList(mockFeedbacks, args?.where).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      create: async ({ data }: any) => {
        const newFb = {
          id: `fb-${Date.now()}`,
          name: data.name,
          email: data.email || null,
          message: data.message,
          reply: null,
          status: 'PENDING',
          createdAt: new Date()
        };
        mockFeedbacks.push(newFb);
        return newFb;
      },
      update: async ({ where, data }: any) => {
        const fb = mockFeedbacks.find(f => f.id === where.id);
        if (fb) {
          if (data.reply !== undefined) fb.reply = data.reply;
          if (data.status !== undefined) fb.status = data.status;
          return fb;
        }
        return null;
      }
    },
    suggestedLocation: {
      findMany: async (args?: any) => {
        // In the database suggestedLocation might be queried, we map mock data
        return filterList(mockSuggestedLocations, args?.where).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      },
      create: async ({ data }: any) => {
        const newSl = {
          id: `sl-${Date.now()}`,
          address: data.address,
          description: data.description,
          photo: data.photo,
          latitude: data.latitude,
          longitude: data.longitude,
          status: 'PENDING',
          createdAt: new Date()
        };
        mockSuggestedLocations.push(newSl);
        return newSl;
      },
      update: async ({ where, data }: any) => {
        const sl = mockSuggestedLocations.find(s => s.id === where.id);
        if (sl) {
          if (data.status !== undefined) {
            sl.status = data.status;
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
  } as any;
};

const prismaClientSingleton = () => {
  const dbUrl = process.env.DATABASE_URL ?? '';
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

  // ✅ PostgreSQL — used on Vercel / production
  if (isPostgres) {
    const { PrismaPg } = require('@prisma/adapter-pg');
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }

  // 🟡 Vercel without Postgres configured → use mock data
  if (process.env.VERCEL === '1') {
    console.warn('[db] Vercel env detected without PostgreSQL — using mock client.');
    return createMockPrismaClient() as unknown as PrismaClient;
  }

  // 💻 Local dev with SQLite
  const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
  const sqliteUrl = dbUrl || 'file:./prisma/dev.db';
  const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
