'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/actions/auth';
import { Trash2, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(username, password);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      if (res.user?.role === 'CLIENT') {
        router.push('/client');
      } else {
        router.push('/dashboard');
      }
    }
  };

  const handleQuickLogin = async (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setError('');

    const res = await login(user, pass);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      if (res.user?.role === 'CLIENT') {
        router.push('/client');
      } else {
        router.push('/dashboard');
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <Trash2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none text-center">
            Smart Waste Dushanbe
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Интеллектуальный мониторинг и вывоз отходов
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 mb-6 text-sm text-rose-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4.5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Имя пользователя
            </label>
            <div className="relative">
              <User className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Имя пользователя"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4.5 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Пароль
            </label>
            <div className="relative">
              <Lock className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Пароль"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4.5 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-950 font-bold py-4 px-4 rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Вход в систему...' : 'Войти'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Demo Fast Login */}
        <div className="mt-8 border-t border-slate-800/80 pt-6">
          <p className="text-center text-xs font-semibold tracking-wider text-slate-500 uppercase mb-4">
            Быстрый вход для демо
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={() => handleQuickLogin('admin', 'admin123')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <span className="text-xs font-bold text-slate-200">Админ</span>
              <span className="text-[10px] text-slate-500 mt-1">admin</span>
            </button>
            <button
              onClick={() => handleQuickLogin('operator', 'operator123')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <span className="text-xs font-bold text-slate-200">Оператор</span>
              <span className="text-[10px] text-slate-500 mt-1">operator</span>
            </button>
            <button
              onClick={() => handleQuickLogin('driver1', 'driver123')}
              disabled={loading}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-slate-800 hover:bg-slate-800/40 hover:border-slate-700 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <span className="text-xs font-bold text-slate-200">Водитель</span>
              <span className="text-[10px] text-slate-500 mt-1">driver1</span>
            </button>
          </div>
        </div>

        {/* Register link */}
        <div className="mt-6 text-center border-t border-slate-800/80 pt-4">
          <p className="text-xs text-slate-500 font-medium">
            Нет аккаунта?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-350 font-bold ml-1 hover:underline transition-all">
              Зарегистрироваться как житель
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
