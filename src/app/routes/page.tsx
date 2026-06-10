import prisma from '@/lib/db';
import RoutesClient from './RoutesClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0;

export default async function RoutesPage() {
  const tasks = await prisma.task.findMany({
    include: {
      container: true,
      driver: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: {
      id: true,
      name: true,
      username: true,
    },
  });

  const serializeTasks = tasks.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    container: {
      ...t.container,
      lastUpdated: t.container.lastUpdated.toISOString(),
    },
    driver: t.driver
      ? {
          id: t.driver.id,
          name: t.driver.name,
          username: t.driver.username,
        }
      : null,
  }));

  return (
    <DashboardLayout>
      <RoutesClient initialTasks={serializeTasks} drivers={drivers} />
    </DashboardLayout>
  );
}
