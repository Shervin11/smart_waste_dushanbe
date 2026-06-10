'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Brain,
  Map as MapIcon,
  Navigation,
  BarChart3,
  Truck,
  Cpu,
  Globe,
  Play,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Menu,
  X,
  Trash2,
  Camera,
  Sun,
  Moon,
  Layers,
  Zap,
  Shield,
  TrendingUp,
} from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER' | 'CLIENT';
}

interface LandingPageClientProps {
  currentUser: UserSession | null;
}

export default function LandingPageClient({ currentUser }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'routing'>('camera');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Theme Toggle Logic
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // AI Camera Simulator States
  const [selectedPreset, setSelectedPreset] = useState<'empty' | 'medium' | 'full'>('full');
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanLog, setScanLog] = useState<string[]>([]);
  const [scanResultReady, setScanResultReady] = useState(false);

  // Route Simulator States
  const [routingState, setRoutingState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [routeStep, setRouteStep] = useState(0);

  // AI Camera Simulation logs
  const logs = {
    empty: [
      'Инициализация камеры...',
      'Получение кадра (Full HD, 60fps)...',
      'Запуск сверточной нейросети YOLOv8...',
      'Поиск объекта: Мусорный контейнер...',
      'Контейнер обнаружен (Координаты: x=124, y=412)...',
      'Анализ заполненности: Обнаружен пустой объем...',
      'Оценка уровня заполнения: ~12%',
      'Анализ завершен.'
    ],
    medium: [
      'Инициализация камеры...',
      'Получение кадра (Full HD, 60fps)...',
      'Запуск сверточной нейросети YOLOv8...',
      'Поиск объекта: Мусорный контейнер...',
      'Контейнер обнаружен (Координаты: x=241, y=390)...',
      'Анализ заполненности: Присутствует умеренное скопление ТБО...',
      'Оценка уровня заполнения: ~48%',
      'Анализ завершен.'
    ],
    full: [
      'Инициализация камеры...',
      'Получение кадра (Full HD, 60fps)...',
      'Запуск сверточной нейросети YOLOv8...',
      'Поиск объекта: Мусорный контейнер...',
      'Контейнер обнаружен (Координаты: x=98, y=384)...',
      'Анализ заполненности: Критическое накопление ТБО...',
      'Обнаружен навал мусора рядом с баком (Переполнение!)...',
      'Оценка уровня заполнения: ~94%',
      'Формирование экстренного предупреждения для диспетчера...',
      'Анализ завершен.'
    ]
  };

  const startAiScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanResultReady(false);
    setScanProgress(0);
    setScanLog([]);

    const steps = logs[selectedPreset];
    let stepIndex = 0;

    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setScanLog(prev => [...prev, steps[stepIndex]]);
        setScanProgress(Math.round(((stepIndex + 1) / steps.length) * 100));
        stepIndex++;
      } else {
        clearInterval(interval);
        setScanning(false);
        setScanResultReady(true);
      }
    }, 400);
  };

  const startRouteSolver = () => {
    if (routingState === 'running') return;
    setRoutingState('running');
    setRouteStep(0);

    const interval = setInterval(() => {
      setRouteStep(prev => {
        if (prev < 4) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setRoutingState('completed');
          return prev;
        }
      });
    }, 1000);
  };

  const resetRouteSolver = () => {
    setRoutingState('idle');
    setRouteStep(0);
  };

  return (
    <div className="flex-1 bg-background text-foreground relative flex flex-col transition-colors duration-300">

      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors duration-300">
        {/* Top gradient line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[68px] flex items-center justify-between">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block leading-tight">
                Smart Waste
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase block -mt-0.5">
                Dushanbe
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
            {['#features', '#interactive-demo', '#metrics'].map((href, i) => (
              <a
                key={href}
                href={href}
                className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-semibold text-xs"
              >
                {i === 0 ? 'О технологии' : i === 1 ? 'Демо' : 'Эффективность'}
              </a>
            ))}
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-700" />

            <button
              onClick={toggleTheme}
              id="theme-toggle"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer"
              title={theme === 'dark' ? 'Светлый режим' : 'Тёмный режим'}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  <strong className="text-slate-700 dark:text-slate-300 font-semibold">{currentUser.name}</strong>
                </span>
                <Link
                  href={currentUser.role === 'CLIENT' ? '/client' : '/dashboard'}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.02] cursor-pointer"
                >
                  В кабинет
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer"
                >
                  Войти
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all shadow-md shadow-emerald-500/20 hover:scale-[1.02] cursor-pointer"
                >
                  Регистрация
                </Link>
              </div>
            )}
          </nav>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-1 animate-fade-in-up">
            {[['#features', 'О технологии'], ['#interactive-demo', 'Интерактивное демо'], ['#metrics', 'Эффективность']].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-slate-600 dark:text-slate-300 font-semibold py-2.5 px-3 rounded-lg hover:bg-emerald-500/5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors text-sm"
              >
                {label}
              </a>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 space-y-2">
              {currentUser ? (
                <Link
                  href={currentUser.role === 'CLIENT' ? '/client' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-5 rounded-xl text-sm"
                >
                  В личный кабинет <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold py-3 px-5 rounded-xl text-sm"
                  >
                    Войти
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-5 rounded-xl text-sm"
                  >
                    Регистрация жителя
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ─── MAIN ─── */}
      <main className="flex-1 relative overflow-x-hidden">

        {/* Background ambient blobs */}
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-emerald-500/8 dark:bg-emerald-500/5 rounded-full blur-[140px]" />
          <div className="absolute top-[30%] right-[-10%] w-[700px] h-[700px] bg-cyan-500/6 dark:bg-cyan-500/4 rounded-full blur-[160px]" />
          <div className="absolute bottom-[5%] left-[20%] w-[500px] h-[500px] bg-teal-500/6 dark:bg-teal-500/3 rounded-full blur-[120px]" />
        </div>

        {/* ─── HERO SECTION ─── */}
        <section className="relative z-10 pt-20 pb-24 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/25 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-widest mb-8 animate-fade-in-up shadow-sm">
            <Cpu className="w-3.5 h-3.5" />
            AI-Экологический мониторинг · Душанбе
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up-1 text-5xl sm:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.05] max-w-5xl">
            Будущее чистого города с{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 dark:from-emerald-400 dark:via-teal-300 dark:to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Искусственным Интеллектом
              </span>
              {/* Underline glow */}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 opacity-50 rounded-full" />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="animate-fade-in-up-2 mt-7 text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-2xl font-normal leading-relaxed">
            Интеллектуальная система контроля переполнения контейнеров ТБО в Душанбе. 
            Распознавание заполненности баков по камерам, умная маршрутизация и ГИС-мониторинг в реальном времени.
          </p>

          {/* CTA buttons */}
          <div className="animate-fade-in-up-3 mt-10 flex flex-col sm:flex-row gap-3 justify-center w-full max-w-md sm:max-w-none">
            {currentUser ? (
              <Link
                href={currentUser.role === 'CLIENT' ? '/client' : '/dashboard'}
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold py-3.5 px-8 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] cursor-pointer"
              >
                Открыть личный кабинет
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="group flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-extrabold py-3.5 px-8 rounded-xl text-sm transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] cursor-pointer"
              >
                Войти в кабинет управления
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <a
              href="#interactive-demo"
              className="group flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-8 rounded-xl text-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current text-emerald-500" />
              Попробовать демо
            </a>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-in-up-4 mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 dark:text-slate-500 font-medium">
            {[
              { icon: <Shield className="w-3.5 h-3.5 text-emerald-500" />, label: 'YOLOv8 нейросеть' },
              { icon: <Zap className="w-3.5 h-3.5 text-teal-500" />, label: 'Real-time обработка' },
              { icon: <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />, label: '99.8% точность' },
            ].map(({ icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                {icon}
                <span>{label}</span>
              </div>
            ))}
          </div>

          {/* Dashboard Preview Shell */}
          <div className="mt-16 w-full max-w-5xl relative animate-float">
            {/* Glow halo */}
            <div className="absolute -inset-4 bg-gradient-to-b from-emerald-500/10 to-transparent rounded-[2.5rem] blur-2xl pointer-events-none" />

            <div className="relative rounded-2xl border border-slate-200/80 dark:border-slate-700/50 bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl p-3 shadow-2xl shadow-slate-900/10 dark:shadow-black/40">
              <div className="relative rounded-xl overflow-hidden aspect-[16/9] border border-slate-200/60 dark:border-slate-800/60 bg-white dark:bg-slate-900 shadow-inner flex items-center justify-center">

                {/* Fake dashboard */}
                <div className="w-full h-full flex flex-col p-4 text-left font-mono text-[9px] sm:text-xs">
                  {/* Header bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-blink" />
                      <span className="font-sans font-bold text-slate-800 dark:text-slate-200 text-xs">Dushanbe Control Room · AI</span>
                    </div>
                    <div className="flex items-center gap-2 font-sans font-semibold text-[10px]">
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded">ONLINE</span>
                      <span className="text-slate-400">14:30</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="flex-1 grid grid-cols-3 gap-3 overflow-hidden">

                    {/* Camera feed */}
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 relative p-3 flex flex-col justify-between">
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[9px] text-slate-500 flex items-center gap-1">
                        <Camera className="w-3 h-3 text-emerald-500" />
                        КАМЕРА #12 // ПР. РУДАКИ
                      </div>

                      <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-24 h-28 border border-slate-200 dark:border-emerald-500/30 bg-slate-100 dark:bg-emerald-500/5 rounded-t-xl rounded-b-md relative flex flex-col justify-end p-1 overflow-hidden">
                          <div className="absolute inset-0 border border-rose-500 animate-pulse flex flex-col justify-between p-1">
                            <span className="bg-rose-500 text-white px-1.5 py-0.5 font-sans font-extrabold text-[7px] tracking-wider self-start rounded">CONTAINER (92% FULL)</span>
                            <span className="text-rose-500 text-[7px] text-right font-bold">ACC: 99.8%</span>
                          </div>
                          <div className="h-[90%] bg-emerald-500/20 dark:bg-emerald-500/30 w-full rounded-sm border-t border-emerald-400/50">
                            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent animate-pulse" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-between text-[8px]">
                        <span>СТАТУС: ТРЕБУЕТСЯ СРОЧНЫЙ ВЫВОЗ</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">ОТПРАВЛЕНО ВОДИТЕЛЮ</span>
                      </div>
                    </div>

                    {/* Stats panel */}
                    <div className="col-span-1 flex flex-col gap-2 font-sans">
                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Маршрут</span>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Truck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">12.4 км</span>
                        </div>
                        <span className="text-[8px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">Очищено 6 баков</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex-1 flex flex-col justify-between">
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-bold">Сводка</span>
                        <div className="space-y-1.5 mt-1.5">
                          {[['Шохмансур', 87, 'bg-rose-500'], ['Сино', 42, 'bg-emerald-500']].map(([label, val, cls]) => (
                            <div key={label as string}>
                              <div className="flex justify-between text-[8px] text-slate-400 mb-0.5">
                                <span>{label}</span><span>{val}%</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1">
                                <div className={`${cls} h-1 rounded-full`} style={{ width: `${val}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>
                        <span className="text-[7px] text-slate-400 mt-1">Обновлено: только что</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* ─── INTERACTIVE DEMO ─── */}
        <section id="interactive-demo" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
          <div className="max-w-7xl mx-auto">

            <div className="flex flex-col items-center text-center mb-14">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/15">
                Интерактивное тестирование
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-5">
                Попробуйте систему в действии
              </h2>
              <p className="mt-3 text-slate-500 dark:text-slate-400 max-w-xl text-sm">
                Протестируйте две ключевые функции: анализ заполненности контейнеров через ИИ-камеру и автоматическое построение ГИС-маршрута.
              </p>

              {/* Tabs */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl mt-8 gap-1 shadow-inner">
                {[
                  { id: 'camera' as const, icon: <Camera className="w-4 h-4" />, label: 'ИИ-Камера' },
                  { id: 'routing' as const, icon: <Navigation className="w-4 h-4" />, label: 'Умная логистика' },
                ].map(({ id, icon, label }) => (
                  <button
                    key={id}
                    id={`tab-${id}`}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeTab === id
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Widget container */}
            <div className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-slate-900/5 dark:shadow-black/30 relative overflow-hidden card-gradient-border">

              {/* TAB 1: AI CAMERA */}
              {activeTab === 'camera' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                  {/* Visual */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col min-h-[300px]">
                    {/* Viewfinder corners */}
                    <div className="absolute inset-4 border border-emerald-500/10 pointer-events-none rounded-xl z-20">
                      {[['top-0 left-0 border-t-2 border-l-2', ''], ['top-0 right-0 border-t-2 border-r-2', ''], ['bottom-0 left-0 border-b-2 border-l-2', ''], ['bottom-0 right-0 border-b-2 border-r-2', '']].map(([cls], i) => (
                        <div key={i} className={`absolute w-3.5 h-3.5 border-emerald-500 ${cls}`} />
                      ))}
                    </div>

                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-20">
                      <Camera className="w-3 h-3 text-emerald-500" />
                      DUSHANBE_CAM_#12
                    </div>

                    <div className="flex-1 flex items-center justify-center p-6 relative">
                      {scanning && (
                        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-[0_0_12px_#10b981] z-20 animate-laser-scan" />
                      )}
                      <div className="w-32 h-40 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-2xl rounded-b-lg relative flex flex-col justify-end p-2 shadow-inner">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700" />
                        <div
                          className={`w-full transition-all duration-1000 ease-out rounded-sm ${
                            selectedPreset === 'empty'
                              ? 'h-[12%] bg-emerald-500/25 border-t border-emerald-400'
                              : selectedPreset === 'medium'
                              ? 'h-[48%] bg-amber-500/25 border-t border-amber-400'
                              : 'h-[92%] bg-rose-500/25 border-t border-rose-400'
                          }`}
                        >
                          <div className={`absolute inset-x-0 bottom-0 top-auto h-full opacity-20 animate-pulse ${
                            selectedPreset === 'empty' ? 'bg-emerald-500' : selectedPreset === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                          }`} />
                        </div>
                        {scanResultReady && (
                          <div
                            className={`absolute inset-x-1 bottom-1 border-2 rounded-lg p-2 flex flex-col justify-between z-10 ${
                              selectedPreset === 'empty'
                                ? 'border-emerald-500 bg-emerald-500/5 top-28'
                                : selectedPreset === 'medium'
                                ? 'border-amber-500 bg-amber-500/5 top-14'
                                : 'border-rose-500 bg-rose-500/5 top-2'
                            }`}
                          >
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase self-start leading-none tracking-wider ${
                              selectedPreset === 'empty' ? 'bg-emerald-500 text-white'
                              : selectedPreset === 'medium' ? 'bg-amber-500 text-slate-900'
                              : 'bg-rose-500 text-white'
                            }`}>
                              {selectedPreset === 'empty' ? 'CONTAINER_OK' : selectedPreset === 'medium' ? 'ATTENTION' : 'OVERFLOW_ALERT'}
                            </span>
                            <div className="text-right font-mono font-bold leading-none mt-auto">
                              <span className={`text-xs block ${
                                selectedPreset === 'empty' ? 'text-emerald-600 dark:text-emerald-400'
                                : selectedPreset === 'medium' ? 'text-amber-600 dark:text-amber-400'
                                : 'text-rose-600 dark:text-rose-400'
                              }`}>
                                {selectedPreset === 'empty' ? '12% Заполнено' : selectedPreset === 'medium' ? '48% Заполнено' : '94% Заполнено'}
                              </span>
                              <span className="text-[7px] text-slate-500 block mt-0.5">YOLOv8 CONF: 99.2%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {scanning && (
                      <div className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin flex-shrink-0" />
                        <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">{scanProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Brain className="w-5 h-5 text-emerald-500" />
                        ИИ-мониторинг контейнера
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Выберите состояние наполнения и запустите анализ нейросетью YOLOv8.
                      </p>

                      <div className="space-y-2 mt-5">
                        <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                          Имитировать уровень заполнения
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            id="preset-empty"
                            onClick={() => { setSelectedPreset('empty'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'empty'
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            Пустой
                          </button>
                          <button
                            id="preset-medium"
                            onClick={() => { setSelectedPreset('medium'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'medium'
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            Средний
                          </button>
                          <button
                            id="preset-full"
                            onClick={() => { setSelectedPreset('full'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'full'
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
                                : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            Полный
                          </button>
                        </div>
                      </div>

                      {/* Log terminal */}
                      <div className="mt-5 bg-slate-950 dark:bg-black rounded-xl p-3 border border-slate-800 dark:border-slate-900 font-mono text-[9px] text-emerald-400 h-32 overflow-y-auto space-y-1 shadow-inner">
                        {scanLog.length === 0 ? (
                          <span className="text-slate-600 italic">{'>'} Нажмите «Запустить анализ ИИ»...</span>
                        ) : (
                          scanLog.map((log, idx) => (
                            <div key={idx} className="flex gap-1.5 items-start">
                              <span className="text-emerald-500 select-none">{'>'}</span>
                              <span className="text-emerald-300">{log}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      id="start-ai-scan"
                      onClick={startAiScan}
                      disabled={scanning}
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                    >
                      {scanning ? (
                        <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Выполняется анализ...</>
                      ) : (
                        <><Brain className="w-3.5 h-3.5" /> Запустить анализ ИИ</>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SMART ROUTING */}
              {activeTab === 'routing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">

                  {/* Map visual */}
                  <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col min-h-[300px]">
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 px-2.5 py-1 rounded-lg flex items-center gap-1.5 z-20">
                      <Layers className="w-3.5 h-3.5 text-emerald-500" />
                      ГИС-МАРШРУТ // СЕКТОР #03
                    </div>

                    <div className="flex-1 relative bg-white dark:bg-slate-950 p-4 flex items-center justify-center">
                      {/* Grid bg */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30" />

                      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                        {/* Depot */}
                        <div className="absolute top-[78%] left-[10%] flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-[7px] text-slate-500 mt-0.5">База ГУП</span>
                        </div>

                        {/* Nodes */}
                        <div className="absolute top-[58%] left-[30%] flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[8px] font-bold">15%</div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Ул. Айни</span>
                        </div>

                        <div className="absolute top-[33%] left-[25%] flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all duration-500 ${
                            routeStep >= 1 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-500'
                          }`}>
                            {routeStep >= 1 ? '✓' : '88%'}
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Пр. Рудаки</span>
                        </div>

                        <div className="absolute top-[16%] left-[60%] flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border-2 transition-all duration-500 ${
                            routeStep >= 2 ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 border-rose-500 text-rose-500'
                          }`}>
                            {routeStep >= 2 ? '✓' : '92%'}
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">М. Зеленый</span>
                        </div>

                        <div className="absolute top-[53%] left-[75%] flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[8px] font-bold">30%</div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Ул. Борбад</span>
                        </div>

                        <div className="absolute top-[13%] right-[10%] flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center text-white shadow-lg transition-all duration-500 ${
                            routeStep >= 3 ? 'bg-cyan-500 shadow-cyan-500/30' : 'bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                          }`}>
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Полигон</span>
                        </div>
                      </div>

                      {/* SVG path */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {routingState !== 'idle' && (
                          <g>
                            <path d="M 124 252 L 178 148" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="100" strokeDashoffset={routeStep >= 1 ? "0" : "100"} className="transition-all duration-700 ease-in-out" />
                            <path d="M 178 148 L 290 80" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="140" strokeDashoffset={routeStep >= 2 ? "0" : "140"} className="transition-all duration-700 ease-in-out" />
                            <path d="M 290 80 L 350 50" fill="none" stroke="#06b6d4" strokeWidth="2" strokeDasharray="70" strokeDashoffset={routeStep >= 3 ? "0" : "70"} className="transition-all duration-700 ease-in-out" />
                          </g>
                        )}
                      </svg>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-emerald-500" />
                        Умная ГИС-маршрутизация
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                        Алгоритм убирает из расписания чистые баки, экономя топливо и время спецтехники.
                      </p>

                      <div className="mt-5 space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                          {[
                            ['Контейнеров всего:', '5', 'text-slate-700 dark:text-slate-200'],
                            ['Критические (>80%):', '2 (Пр. Рудаки, Зеленый)', 'text-rose-500'],
                            ['Пропущено чистых:', '2', 'text-emerald-600 dark:text-emerald-400'],
                          ].map(([label, val, cls]) => (
                            <div key={label as string} className="flex justify-between items-center">
                              <span className="text-slate-500">{label}</span>
                              <span className={`font-bold ${cls}`}>{val}</span>
                            </div>
                          ))}
                        </div>

                        {routingState === 'completed' && (
                          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-xl p-4 space-y-3">
                            <h4 className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Эффективность маршрута:</h4>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[9px] text-slate-400 block">Дистанция</span>
                                <span className="text-sm font-black text-slate-800 dark:text-slate-200">12.4 км</span>
                              </div>
                              <div className="bg-white dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[9px] text-slate-400 block">Расход ГСМ</span>
                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">−35%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      {routingState === 'completed' ? (
                        <button
                          onClick={resetRouteSolver}
                          className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 px-4 rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          Сбросить симуляцию
                        </button>
                      ) : (
                        <button
                          id="start-route"
                          onClick={startRouteSolver}
                          disabled={routingState === 'running'}
                          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
                        >
                          {routingState === 'running' ? (
                            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Расчет путей...</>
                          ) : (
                            <><Navigation className="w-3.5 h-3.5" /> Построить маршрут ИИ</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ─── FEATURES SECTION ─── */}
        <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/15">
              Технологическая архитектура
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mt-5">
              Мощный комплексный стек
            </h2>
            <p className="mt-3 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Инновационные решения автоматизации мониторинга, картографии и планирования ресурсов для служб ЖКХ.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* Card 1 */}
            <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="relative text-sm font-bold text-slate-800 dark:text-white mb-2">Компьютерное зрение</h3>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Сверточные нейронные сети YOLOv8 анализируют видеопотоки с камер в реальном времени, определяя уровень заполнения баков и наличие навалов мусора.</p>
            </div>

            {/* Card 2 */}
            <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-5 group-hover:bg-teal-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                <MapIcon className="w-6 h-6" />
              </div>
              <h3 className="relative text-sm font-bold text-slate-800 dark:text-white mb-2">ГИС-Картография</h3>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Интерактивная карта на базе Leaflet отображает все площадки сбора отходов, их статусы и отслеживает перемещение мусоровозов в реальном времени.</p>
            </div>

            {/* Card 3 */}
            <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-5 group-hover:bg-cyan-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="relative text-sm font-bold text-slate-800 dark:text-white mb-2">Умные маршруты</h3>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Алгоритмы оптимизации логистики строят наиболее экономичные маршруты объезда только для тех контейнеров, которые действительно нуждаются в очистке.</p>
            </div>

            {/* Card 4 */}
            <div className="group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:-translate-y-2 hover:shadow-xl transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />
              <div className="relative w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="relative text-sm font-bold text-slate-800 dark:text-white mb-2">Аналитика и прогнозы</h3>
              <p className="relative text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Построение графиков накопления отходов в различных секторах города позволяет прогнозировать пиковые нагрузки и оптимизировать расписания.</p>
            </div>

          </div>
        </section>

        {/* ─── METRICS SECTION ─── */}
        <section id="metrics" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-200/50 dark:border-slate-800/50 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Text */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/15">
                  Эффективность реформы
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  Экономика и экология
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  Внедрение Smart Waste Dushanbe кардинально меняет подход к городскому хозяйству, снижая операционные затраты и улучшая санитарно-экологическое состояние города.
                </p>

                <div className="space-y-4 pt-2">
                  {[
                    { title: 'Снижение амортизации', desc: 'Сокращение пробега снижает износ мусоровозов и траты на запчасти.' },
                    { title: 'Чистые дворы', desc: 'ИИ предупреждает диспетчера до того, как контейнеры переполнятся.' },
                  ].map(({ title, desc }) => (
                    <div key={title} className="flex gap-3 items-start">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md shadow-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{title}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stat cards */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {[
                  { value: '45%', label: 'Экономия расходов', desc: 'Оптимизация логистики сводит к минимуму холостые пробеги.', from: 'from-emerald-600', to: 'to-teal-500', glow: 'emerald' },
                  { value: '99.8%', label: 'Точность распознавания', desc: 'ИИ-модель обучена на сотнях тысяч кадров.', from: 'from-cyan-600', to: 'to-teal-500', glow: 'cyan' },
                  { value: '< 15 мин', label: 'Диспетчеризация', desc: 'От определения переполнения до задания водителю.', from: 'from-emerald-600', to: 'to-teal-500', glow: 'emerald' },
                  { value: '480 т', label: 'Предотвращено CO₂', desc: 'Ежегодное снижение выбросов благодаря оптимизации.', from: 'from-teal-600', to: 'to-cyan-500', glow: 'teal' },
                ].map(({ value, label, desc, from, to, glow }) => (
                  <div
                    key={label}
                    className={`group relative bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 p-8 rounded-2xl shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-${glow}-500/5 rounded-full blur-2xl`} />
                    <span className={`relative text-4xl sm:text-5xl font-black bg-gradient-to-r ${from} dark:${from.replace('600', '400')} ${to} dark:${to.replace('500', '400')} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 inline-block`}>
                      {value}
                    </span>
                    <div className="relative mt-5 text-left">
                      <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-10 px-4 sm:px-6 lg:px-8 relative z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Trash2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} Smart Waste Dushanbe. Все права защищены.
              </span>
            </div>

            <div className="flex gap-6 text-xs text-slate-500 dark:text-slate-500 font-semibold">
              <a href="#features" className="hover:text-emerald-500 transition-colors">О технологии</a>
              <a href="#interactive-demo" className="hover:text-emerald-500 transition-colors">Демо</a>
              <a href="#metrics" className="hover:text-emerald-500 transition-colors">Эффективность</a>
            </div>

            <div className="text-[10px] text-slate-400 dark:text-slate-600 font-mono">
              v1.3.0 · Dushanbe Digital Initiative
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
