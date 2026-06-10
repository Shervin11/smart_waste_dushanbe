import { NextResponse } from 'next/server';
import prisma from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, status } = body;

    if (!taskId || !status) {
      return NextResponse.json(
        { error: 'Missing taskId or status' },
        { status: 400 }
      );
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    const dataToUpdate: any = { status };
    if (status === 'COMPLETED') {
      dataToUpdate.completedAt = new Date();
    }

    // Update the task status
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: dataToUpdate,
      include: {
        container: true,
      },
    });

    // If task is completed, reset the container status to empty
    if (status === 'COMPLETED') {
      await prisma.container.update({
        where: { id: updatedTask.containerId },
        data: {
          fillLevel: 0,
          overflow: false,
          lastUpdated: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true, task: updatedTask });
  } catch (error: any) {
    console.error('Update task status error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
