import { Container } from '@prisma/client';
import prisma from '@/lib/db';
import CamerasClient from './CamerasClient';
import DashboardLayout from '@/components/DashboardLayout';

export const revalidate = 0;

export default async function CamerasPage() {
  const containers = await prisma.container.findMany({
    orderBy: { id: 'asc' },
  });

  const serializeContainers = containers.map((c: Container) => ({
    ...c,
    lastUpdated: c.lastUpdated.toISOString(),
  }));

  const hasApiKey = !!process.env.GEMINI_API_KEY;

  return (
    <DashboardLayout>
      <CamerasClient containers={serializeContainers} hasApiKey={hasApiKey} />
    </DashboardLayout>
  );
}
