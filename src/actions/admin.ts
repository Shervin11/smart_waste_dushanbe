'use server';

import prisma from '@/lib/db';

export async function replyToFeedback(id: string, reply: string) {
  try {
    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        reply,
        status: 'REPLIED',
      },
    });
    return { success: true, feedback };
  } catch (error) {
    console.error('replyToFeedback error:', error);
    return { error: 'Не удалось отправить ответ' };
  }
}

export async function approveSuggestedLocation(id: string) {
  try {
    // 1. Get the suggested location details
    const suggested = await prisma.suggestedLocation.findUnique({
      where: { id },
    });

    if (!suggested) {
      return { error: 'Место не найдено' };
    }

    // 2. Mark the suggested location as APPROVED in the database
    const updated = await prisma.suggestedLocation.update({
      where: { id },
      data: { status: 'APPROVED' },
    });

    // 3. Create a new Container from the coordinates and address!
    // Note: For local Prisma, we need to insert a container record.
    // In our mock client db.ts, suggestedLocation.update automatically handles this if Vercel is active.
    // Here we also do it explicitly so it works on SQLite local dev!
    const uniqueId = `DUS-${Math.floor(110 + Math.random() * 880)}`;
    
    await prisma.container.create({
      data: {
        id: uniqueId,
        address: suggested.address,
        latitude: suggested.latitude,
        longitude: suggested.longitude,
        fillLevel: 80, // Set critical level so it triggers dispatch attention right away
        overflow: true,
        district: 'Sino', // default Sino
      },
    });

    return { success: true, location: updated };
  } catch (error) {
    console.error('approveSuggestedLocation error:', error);
    return { error: 'Не удалось одобрить место' };
  }
}

export async function rejectSuggestedLocation(id: string) {
  try {
    const updated = await prisma.suggestedLocation.update({
      where: { id },
      data: { status: 'REJECTED' },
    });
    return { success: true, location: updated };
  } catch (error) {
    console.error('rejectSuggestedLocation error:', error);
    return { error: 'Не удалось отклонить место' };
  }
}

export async function getAllFeedbacks() {
  try {
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Serialize dates
    return feedbacks.map(f => ({
      ...f,
      createdAt: f.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getAllFeedbacks error:', error);
    return [];
  }
}

export async function getAllSuggestedLocations() {
  try {
    const locations = await prisma.suggestedLocation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Serialize dates
    return locations.map(l => ({
      ...l,
      createdAt: l.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getAllSuggestedLocations error:', error);
    return [];
  }
}
