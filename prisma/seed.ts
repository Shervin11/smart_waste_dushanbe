import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Clean database
  await prisma.task.deleteMany({});
  await prisma.container.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Database cleaned.');

  // Create Users
  const admin = await prisma.user.create({
    data: {
      username: 'admin',
      password: 'admin123', // В реальном проекте должен быть хэш
      name: 'Администратор Системы',
      role: 'ADMIN',
    },
  });

  const operator = await prisma.user.create({
    data: {
      username: 'operator',
      password: 'operator123',
      name: 'Алишер (Оператор)',
      role: 'OPERATOR',
    },
  });

  const driver1 = await prisma.user.create({
    data: {
      username: 'driver1',
      password: 'driver123',
      name: 'Сомон (Водитель)',
      role: 'DRIVER',
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      username: 'driver2',
      password: 'driver123',
      name: 'Джамшед (Водитель)',
      role: 'DRIVER',
    },
  });

  console.log('Users seeded.');

  // Create Containers
  const containers = [
    {
      id: 'DUS-101',
      address: 'ул. Нусратулло Махсум, 45',
      latitude: 38.564,
      longitude: 68.752,
      fillLevel: 45,
      overflow: false,
      district: 'Sino',
    },
    {
      id: 'DUS-102',
      address: 'ул. Бободжон Гафуров, 12',
      latitude: 38.571,
      longitude: 68.765,
      fillLevel: 85,
      overflow: true,
      district: 'Sino',
    },
    {
      id: 'DUS-103',
      address: 'пр. Рудаки, 84 (возле театра)',
      latitude: 38.586,
      longitude: 68.786,
      fillLevel: 20,
      overflow: false,
      district: 'Ismoili Somoni',
    },
    {
      id: 'DUS-104',
      address: 'ул. Карамова, 15 (парк Хайям)',
      latitude: 38.591,
      longitude: 68.775,
      fillLevel: 95,
      overflow: true,
      district: 'Ismoili Somoni',
    },
    {
      id: 'DUS-105',
      address: 'ул. Айни, 34',
      latitude: 38.552,
      longitude: 68.805,
      fillLevel: 60,
      overflow: false,
      district: 'Shohmansur',
    },
    {
      id: 'DUS-106',
      address: 'ул. Дониш, 9 (Аэропорт)',
      latitude: 38.545,
      longitude: 68.815,
      fillLevel: 10,
      overflow: false,
      district: 'Shohmansur',
    },
    {
      id: 'DUS-107',
      address: 'ул. Неъмат Карабаев, 65',
      latitude: 38.525,
      longitude: 68.778,
      fillLevel: 75,
      overflow: false,
      district: 'Firdavsi',
    },
    {
      id: 'DUS-108',
      address: 'ул. Джами, 3',
      latitude: 38.515,
      longitude: 68.790,
      fillLevel: 92,
      overflow: true,
      district: 'Firdavsi',
    },
  ];

  for (const container of containers) {
    await prisma.container.create({
      data: container,
    });
  }

  console.log('Containers seeded.');

  // Create active pickup tasks for high fill-level containers
  // DUS-102 (85%) -> Assigned to Driver 1
  await prisma.task.create({
    data: {
      containerId: 'DUS-102',
      driverId: driver1.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
    },
  });

  // DUS-104 (95%) -> Pending
  await prisma.task.create({
    data: {
      containerId: 'DUS-104',
      status: 'PENDING',
      priority: 'HIGH',
    },
  });

  // DUS-108 (92%) -> Assigned to Driver 2
  await prisma.task.create({
    data: {
      containerId: 'DUS-108',
      driverId: driver2.id,
      status: 'PENDING',
      priority: 'HIGH',
    },
  });

  console.log('Tasks seeded.');
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
