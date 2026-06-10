import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { container_id, fill_level, overflow } = body;

    if (!container_id) {
      return NextResponse.json(
        { error: 'Missing container_id' },
        { status: 400 }
      );
    }

    // 1. Check if container exists
    const container = await prisma.container.findUnique({
      where: { id: container_id },
    });

    if (!container) {
      return NextResponse.json(
        { error: `Container ${container_id} not found` },
        { status: 404 }
      );
    }

    // 2. Update container status
    const updatedContainer = await prisma.container.update({
      where: { id: container_id },
      data: {
        fillLevel: typeof fill_level === 'number' ? fill_level : container.fillLevel,
        overflow: typeof overflow === 'boolean' ? overflow : container.overflow,
        lastUpdated: new Date(),
      },
    });

    // 3. Auto-task logic: If fill level >= 80% or overflow
    const isCritical =
      updatedContainer.fillLevel >= 80 ||
      updatedContainer.overflow;

    let createdTask = null;

    if (isCritical) {
      // Check if there is already an active task (PENDING or IN_PROGRESS)
      const existingTask = await prisma.task.findFirst({
        where: {
          containerId: container_id,
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      });

      if (!existingTask) {
        // Determine priority
        let priority = 'MEDIUM';
        if (updatedContainer.overflow || updatedContainer.fillLevel >= 95) {
          priority = 'HIGH';
        }

        createdTask = await prisma.task.create({
          data: {
            containerId: container_id,
            status: 'PENDING',
            priority,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      container: updatedContainer,
      task_created: !!createdTask,
      task: createdTask,
    });
  } catch (error: any) {
    console.error('AI Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
