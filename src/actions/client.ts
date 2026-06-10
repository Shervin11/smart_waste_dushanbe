'use server';

import { Feedback, SuggestedLocation } from '@prisma/client';
import prisma from '@/lib/db';

export async function submitFeedback(name: string, email: string | null, message: string) {
  try {
    const feedback = await prisma.feedback.create({
      data: {
        name,
        email,
        message,
        status: 'PENDING',
      },
    });
    return { success: true, feedback };
  } catch (error) {
    console.error('submitFeedback error:', error);
    return { error: 'Не удалось отправить сообщение' };
  }
}

export async function submitSuggestedLocation(
  address: string,
  description: string,
  photo: string,
  latitude: number,
  longitude: number
) {
  try {
    const location = await prisma.suggestedLocation.create({
      data: {
        address,
        description,
        photo,
        latitude,
        longitude,
        status: 'PENDING',
      },
    });
    return { success: true, location };
  } catch (error) {
    console.error('submitSuggestedLocation error:', error);
    return { error: 'Не удалось предложить новое место' };
  }
}

export async function getClientFeedbacks(name: string) {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { name },
      orderBy: { createdAt: 'desc' },
    });
    // Serialize dates for Client Components
    return feedbacks.map((f: Feedback) => ({
      ...f,
      createdAt: f.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getClientFeedbacks error:', error);
    return [];
  }
}

export async function getClientSuggestedLocations() {
  try {
    const locations = await prisma.suggestedLocation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    // Serialize dates
    return locations.map((l: SuggestedLocation) => ({
      ...l,
      createdAt: l.createdAt.toISOString()
    }));
  } catch (error) {
    console.error('getClientSuggestedLocations error:', error);
    return [];
  }
}
