import { Container, Task, User } from '@prisma/client';
import prisma from '@/lib/db';
import DashboardClient from './DashboardClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0; // Disable caching to ensure real-time updates

export default async function DashboardPage() {
  const containers = await prisma.container.findMany({
    include: {
      tasks: {
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      },
    },
  });

  const tasks = await prisma.task.findMany({
    include: {
      container: true,
      driver: true,
    },
  });

  const serializeContainers = containers.map((c: Container & { tasks: Task[] }) => ({
    ...c,
    lastUpdated: c.lastUpdated.toISOString(),
  }));

  const serializeTasks = tasks.map((t: Task & { container: Container; driver: User | null }) => ({
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
          role: t.driver.role,
          username: t.driver.username,
        }
      : null,
  }));

  return (
    <DashboardLayout>
      <DashboardClient containers={serializeContainers} tasks={serializeTasks} />
    </DashboardLayout>
  );
}
