import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { Pool } from 'pg';

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? '';
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    const pool = new Pool({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({ adapter });
  }
  // SQLite fallback for local dev
  const adapter = new PrismaBetterSqlite3({ url: dbUrl || 'file:./prisma/dev.db' });
  return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean database
  await prisma.task.deleteMany({});
  await prisma.feedback.deleteMany({}).catch(() => {});
  await prisma.suggestedLocation.deleteMany({}).catch(() => {});
  await prisma.container.deleteMany({});
  await prisma.user.deleteMany({});
  console.log('✅ Database cleaned.');

  // Create Users
  const driver1 = await prisma.user.create({
    data: { username: 'driver1', password: 'driver123', name: 'Сомон (Водитель)', role: 'DRIVER' },
  });
  const driver2 = await prisma.user.create({
    data: { username: 'driver2', password: 'driver123', name: 'Джамшед (Водитель)', role: 'DRIVER' },
  });
  await prisma.user.create({
    data: { username: 'admin', password: 'admin123', name: 'Администратор Системы', role: 'ADMIN' },
  });
  await prisma.user.create({
    data: { username: 'operator', password: 'operator123', name: 'Алишер (Оператор)', role: 'OPERATOR' },
  });
  console.log('✅ Users seeded.');

  // Create Containers
  const containers = [
    { id: 'DUS-101', address: 'ул. Нусратулло Махсум, 45',       latitude: 38.564, longitude: 68.752, fillLevel: 45, overflow: false, district: 'Sino' },
    { id: 'DUS-102', address: 'ул. Бободжон Гафуров, 12',        latitude: 38.571, longitude: 68.765, fillLevel: 85, overflow: true,  district: 'Sino' },
    { id: 'DUS-103', address: 'пр. Рудаки, 84 (возле театра)',   latitude: 38.586, longitude: 68.786, fillLevel: 20, overflow: false, district: 'Ismoili Somoni' },
    { id: 'DUS-104', address: 'ул. Карамова, 15 (парк Хайям)',   latitude: 38.591, longitude: 68.775, fillLevel: 95, overflow: true,  district: 'Ismoili Somoni' },
    { id: 'DUS-105', address: 'ул. Айни, 34',                    latitude: 38.552, longitude: 68.805, fillLevel: 60, overflow: false, district: 'Shohmansur' },
    { id: 'DUS-106', address: 'ул. Дониш, 9 (Аэропорт)',         latitude: 38.545, longitude: 68.815, fillLevel: 10, overflow: false, district: 'Shohmansur' },
    { id: 'DUS-107', address: 'ул. Неъмат Карабаев, 65',         latitude: 38.525, longitude: 68.778, fillLevel: 75, overflow: false, district: 'Firdavsi' },
    { id: 'DUS-108', address: 'ул. Джами, 3',                    latitude: 38.515, longitude: 68.790, fillLevel: 92, overflow: true,  district: 'Firdavsi' },
  ];
  for (const c of containers) await prisma.container.create({ data: c });
  console.log('✅ Containers seeded.');

  // Create Tasks
  await prisma.task.create({ data: { containerId: 'DUS-102', driverId: driver1.id, status: 'IN_PROGRESS', priority: 'HIGH' } });
  await prisma.task.create({ data: { containerId: 'DUS-104', status: 'PENDING', priority: 'HIGH' } });
  await prisma.task.create({ data: { containerId: 'DUS-108', driverId: driver2.id, status: 'PENDING', priority: 'HIGH' } });
  console.log('✅ Tasks seeded.');

  // Seed Feedback
  await prisma.feedback.create({
    data: { name: 'Мадина', email: 'madina@example.com', message: 'Контейнеры на ул. Борбад очищают не вовремя.', reply: 'Спасибо, скорректировали маршрут.', status: 'REPLIED' }
  }).catch(() => {});
  await prisma.feedback.create({
    data: { name: 'Илхом', email: 'ilhom@example.com', message: 'Почему на карте не виден сектор Фирдавси?', status: 'PENDING' }
  }).catch(() => {});
  console.log('✅ Feedback seeded.');

  console.log('🎉 Seeding finished successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
