'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/db';

export async function login(username: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || user.password !== password) {
      return { error: 'Неверное имя пользователя или пароль' };
    }

    const cookieStore = await cookies();
    cookieStore.set(
      'session_user',
      JSON.stringify({
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      }
    );

    return {
      success: true,
      user: { id: user.id, name: user.name, role: user.role },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: 'Произошла ошибка при авторизации' };
  }
}

export async function logout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session_user');
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { error: 'Произошла ошибка при выходе' };
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session_user');
    if (!session) return null;
    return JSON.parse(session.value) as {
      id: string;
      name: string;
      username: string;
      role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
    };
  } catch {
    return null;
  }
}
