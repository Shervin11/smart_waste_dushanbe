import { Container } from '@prisma/client';
import prisma from '@/lib/db';
import ContainersClient from './ContainersClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0;

export default async function ContainersPage() {
  const containers = await prisma.container.findMany({
    orderBy: { id: 'asc' },
  });

  const serializeContainers = containers.map((c: Container) => ({
    ...c,
    lastUpdated: c.lastUpdated.toISOString(),
  }));

  return (
    <DashboardLayout>
      <ContainersClient containers={serializeContainers} />
    </DashboardLayout>
  );
}
