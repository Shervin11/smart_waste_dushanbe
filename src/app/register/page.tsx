'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerClient } from '@/actions/auth';
import { Trash2, Lock, User, AlertCircle, ArrowRight, Clipboard } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await registerClient(username, password, name);
    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push('/client');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 font-sans text-slate-100 relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
            <User className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none text-center">
            Регистрация жителя
          </h1>
          <p className="text-xs text-slate-400 font-medium mt-2">
            Smart Waste Dushanbe — Портал граждан
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 mb-6 text-sm text-rose-400 animate-pulse">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Ваше имя (ФИО)
            </label>
            <div className="relative">
              <Clipboard className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Иван Иванович"
                required
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4.5 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Имя пользователя (Логин)
            </label>
            <div className="relative">
              <User className="absolute left-4.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Логин"
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
                placeholder="••••••••"
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
            {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Redirect Link */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            Уже есть аккаунт?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-350 font-bold ml-1 hover:underline transition-all">
              Войти в систему
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
