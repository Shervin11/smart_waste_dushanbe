'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { login } from '@/actions/auth';
import { Trash2, Lock, User, AlertCircle, ArrowRight, Shield, Zap } from 'lucide-react';

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

      {/* Animated grid bg */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-[140px] pointer-events-none animate-glow" style={{ animationDelay: '1.5s' }} />

      {/* Corner gradient */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">

          {/* Inner gradient glow */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 to-transparent pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
                <Trash2 className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none text-center">
              Smart Waste Dushanbe
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-2 text-center">
              Интеллектуальный мониторинг и вывоз отходов
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 mb-6 text-sm text-rose-400 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Имя пользователя
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите логин"
                  required
                  className="input-glow w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Пароль
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="input-glow w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                />
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Вход в систему...
                </>
              ) : (
                <>
                  Войти
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Quick Login */}
          <div className="mt-8 border-t border-slate-800/70 pt-6">
            <p className="text-center text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-4 flex items-center justify-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Быстрый вход для демо
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="quick-login-admin"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all text-center cursor-pointer disabled:opacity-50 group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">Админ</span>
                <span className="text-[10px] text-slate-600 mt-0.5 font-mono">admin</span>
              </button>
              <button
                id="quick-login-operator"
                onClick={() => handleQuickLogin('operator', 'operator123')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800 hover:border-sky-500/30 hover:bg-sky-500/5 transition-all text-center cursor-pointer disabled:opacity-50 group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors">Оператор</span>
                <span className="text-[10px] text-slate-600 mt-0.5 font-mono">operator</span>
              </button>
              <button
                id="quick-login-driver1"
                onClick={() => handleQuickLogin('driver1', 'driver123')}
                disabled={loading}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-800 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all text-center cursor-pointer disabled:opacity-50 group"
              >
                <span className="text-xs font-bold text-slate-200 group-hover:text-violet-400 transition-colors">Водитель</span>
                <span className="text-[10px] text-slate-600 mt-0.5 font-mono">driver1</span>
              </button>
            </div>
          </div>

          {/* Register */}
          <div className="mt-5 text-center">
            <p className="text-xs text-slate-500">
              Нет аккаунта?{' '}
              <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors underline underline-offset-2 decoration-emerald-400/30">
                Зарегистрироваться как житель
              </Link>
            </p>
          </div>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-slate-600">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] font-medium">Защищённое соединение</span>
          </div>
        </div>
      </div>
    </div>
  );
}
