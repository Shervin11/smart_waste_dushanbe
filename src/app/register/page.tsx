'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerClient } from '@/actions/auth';
import { Trash2, Lock, User, AlertCircle, ArrowRight, Clipboard, Shield, CheckCircle2 } from 'lucide-react';

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

      {/* Animated grid bg */}
      <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />

      {/* Ambient glow blobs */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-1/3 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-cyan-500/6 rounded-full blur-[120px] pointer-events-none animate-glow" style={{ animationDelay: '2s' }} />

      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/60 rounded-2xl p-8 shadow-2xl shadow-black/60 relative overflow-hidden">

          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/3 to-transparent pointer-events-none rounded-2xl" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

          {/* Header */}
          <div className="flex flex-col items-center mb-8 relative">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl" />
              <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30">
                <User className="w-7 h-7" />
              </div>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight leading-none text-center">
              Регистрация жителя
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-2 text-center">
              Smart Waste Dushanbe — Портал граждан
            </p>
          </div>

          {/* Benefits strip */}
          <div className="flex items-center justify-around mb-7 py-3 px-4 bg-emerald-500/5 border border-emerald-500/15 rounded-xl">
            {[
              { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Бесплатно' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Быстро' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Безопасно' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                {icon}
                {label}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 bg-rose-500/10 border border-rose-500/25 rounded-xl p-3.5 mb-6 text-rose-400 animate-fade-in-up">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Ваше имя (ФИО)
              </label>
              <div className="relative">
                <Clipboard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="reg-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Иванов Иван Иванович"
                  required
                  className="input-glow w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3.5 pl-11 pr-4 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                Логин
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="reg-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Придумайте логин"
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
                  id="reg-password"
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
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3.5 px-4 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 cursor-pointer disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Создание аккаунта...
                </>
              ) : (
                <>
                  Зарегистрироваться
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Уже есть аккаунт?{' '}
              <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold ml-1 transition-colors underline underline-offset-2 decoration-emerald-400/30">
                Войти в систему
              </Link>
            </p>
          </div>

          <div className="mt-5 flex items-center justify-center gap-1.5 text-slate-600">
            <Shield className="w-3 h-3" />
            <span className="text-[10px] font-medium">Данные защищены</span>
          </div>
        </div>
      </div>
    </div>
  );
}
