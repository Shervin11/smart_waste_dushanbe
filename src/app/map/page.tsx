import prisma from '@/lib/db';
import MapClient from './MapClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0;

export default async function MapPage() {
  const containers = await prisma.container.findMany({
    include: {
      tasks: {
        where: {
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      },
    },
  });

  const serializeContainers = containers.map((c) => ({
    ...c,
    lastUpdated: c.lastUpdated.toISOString(),
  }));

  return (
    <DashboardLayout>
      <MapClient containers={serializeContainers} />
    </DashboardLayout>
  );
}
