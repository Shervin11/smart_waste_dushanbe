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
  Eye, 
  Layers, 
  FileText 
} from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
}

interface LandingPageClientProps {
  currentUser: UserSession | null;
}

export default function LandingPageClient({ currentUser }: LandingPageClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'camera' | 'routing'>('camera');
  
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

  // Run AI Scan
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
    }, 450);
  };

  // Run Route Optimization
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
    }, 1200);
  };

  const resetRouteSolver = () => {
    setRoutingState('idle');
    setRouteStep(0);
  };

  return (
    <div className="flex-1 bg-slate-950 font-sans text-slate-100 relative overflow-hidden flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* Background radial glow fields */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-cyan-500/10 rounded-full blur-[180px] pointer-events-none z-0" />
      <div className="absolute bottom-10 left-1/3 -translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[140px] pointer-events-none z-0" />

      {/* Cyber Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0223120b_1px,transparent_1px),linear-gradient(to_bottom,#0223120b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_80%,transparent_100%)] pointer-events-none z-0"
      />

      {/* Glassmorphic Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-900 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-md shadow-emerald-500/5">
              <Trash2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                Smart Waste
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block -mt-0.5">
                Dushanbe
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">О технологии</a>
            <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">Интерактивное демо</a>
            <a href="#metrics" className="hover:text-emerald-400 transition-colors">Эффективность</a>
            <span className="w-px h-5 bg-slate-800" />
            
            {currentUser ? (
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">
                  Вы вошли как: <strong className="text-slate-200">{currentUser.name}</strong>
                </span>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer"
                >
                  В кабинет
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-850 hover:bg-slate-850 hover:border-slate-800 text-slate-200 font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Войти в систему
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </nav>

          {/* Mobile Menu Trigger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-850 text-slate-400 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-900 bg-slate-950/95 px-4 pt-4 pb-6 space-y-4">
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 font-medium py-2 hover:text-emerald-400 transition-colors"
            >
              О технологии
            </a>
            <a 
              href="#interactive-demo" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 font-medium py-2 hover:text-emerald-400 transition-colors"
            >
              Интерактивное демо
            </a>
            <a 
              href="#metrics" 
              onClick={() => setMobileMenuOpen(false)}
              className="block text-slate-300 font-medium py-2 hover:text-emerald-400 transition-colors"
            >
              Эффективность
            </a>
            <div className="border-t border-slate-900 pt-4">
              {currentUser ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400">
                    Вошли как: <strong className="text-slate-200">{currentUser.name}</strong>
                  </p>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-5 rounded-xl text-sm transition-all"
                  >
                    В личный кабинет
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-900 border border-slate-800 text-slate-200 font-bold py-3 px-5 rounded-xl text-sm transition-all"
                >
                  Войти в систему
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10">
        
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-28 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            AI-ЭКОЛОГИЧЕСКИЙ МОНИТОРИНГ
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.05] max-w-4xl">
            Будущее чистого города с{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-sm">
              Искусственным Интеллектом
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed">
            Интеллектуальная система контроля переполнения контейнеров ТБО в Душанбе. Распознавание заполненности баков по камерам, построение умных маршрутов и мониторинг ГИС.
          </p>

          {/* Call to Actions */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md sm:max-w-none">
            {currentUser ? (
              <Link
                href="/dashboard"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/15 hover:shadow-emerald-400/25 hover:-translate-y-0.5"
              >
                Открыть панель управления
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-4 px-8 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/15 hover:shadow-emerald-400/25 hover:-translate-y-0.5"
              >
                Войти как оператор / водитель
                <ArrowRight className="w-4.5 h-4.5" />
              </Link>
            )}
            <a
              href="#interactive-demo"
              className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-350 hover:text-slate-100 font-bold py-4 px-8 rounded-2xl text-sm transition-all hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-current" />
              Попробовать симуляцию
            </a>
          </div>

          {/* Floating Hero Widget Previews */}
          <div className="mt-20 w-full max-w-5xl relative rounded-3xl border border-slate-900 bg-slate-950/40 backdrop-blur-xl p-3 shadow-2xl shadow-emerald-500/5">
            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-slate-850 bg-slate-900/40 flex items-center justify-center">
              {/* Graphic background representing interface */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#092c1c_0%,transparent_60%)] pointer-events-none" />
              
              {/* Fake dashboard shell */}
              <div className="w-full h-full flex flex-col p-4 text-left font-mono text-[10px] sm:text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-850 text-slate-400 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-sans font-semibold text-slate-200">Dushanbe Control Room AI</span>
                  </div>
                  <div className="flex items-center gap-2 font-sans font-medium">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">ONLINE</span>
                    <span>14:30</span>
                  </div>
                </div>

                {/* Body split */}
                <div className="flex-1 grid grid-cols-3 gap-4 overflow-hidden">
                  {/* Left Column: Cam feed */}
                  <div className="col-span-2 bg-slate-950/90 rounded-xl border border-slate-850 relative p-3 flex flex-col justify-between">
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-900/80 border border-slate-800 text-[10px] text-slate-350 flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      КАМЕРА #04 // УЛ. КАРАТЕГИНСКАЯ
                    </div>
                    {/* Fake Container Render */}
                    <div className="flex-1 flex items-center justify-center relative">
                      <div className="w-28 h-32 border-2 border-emerald-500/30 bg-emerald-500/5 rounded-t-xl rounded-b-md relative flex flex-col justify-end p-1.5 overflow-hidden">
                        {/* Detection grid box */}
                        <div className="absolute inset-0 border-2 border-rose-500 animate-pulse flex flex-col justify-between p-1.5">
                          <span className="bg-rose-500 text-slate-950 px-1 py-0.5 font-sans font-extrabold text-[8px] tracking-wider self-start rounded-xs">
                            CONTAINER (92.4% FULL)
                          </span>
                          <span className="text-rose-400 text-[8px] text-right">ACC: 99.8%</span>
                        </div>
                        {/* Debris level inside */}
                        <div className="h-[90%] bg-emerald-500/20 w-full rounded-xs border-t border-emerald-400/50 relative">
                          {/* Animated filling lines */}
                          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent animate-pulse" />
                        </div>
                      </div>
                    </div>
                    {/* Log status */}
                    <div className="mt-2 pt-2 border-t border-slate-900 text-slate-400 flex items-center justify-between text-[9px]">
                      <span>СТАТУС: ТРЕБУЕТСЯ СРОЧНЫЙ ВЫВОЗ</span>
                      <span className="text-emerald-400 font-bold">ОТПРАВЛЕНО ВОДИТЕЛЮ #2</span>
                    </div>
                  </div>

                  {/* Right Column: Mini Stats */}
                  <div className="col-span-1 flex flex-col gap-3 font-sans">
                    <div className="bg-slate-950/60 backdrop-blur p-3 rounded-xl border border-slate-850">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Оптимальный маршрут</span>
                      <div className="flex items-center gap-2 mt-2">
                        <Truck className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-slate-200">12.4 км</span>
                      </div>
                      <span className="text-[9px] text-emerald-400 mt-1 block">Путь построен ИИ по 6 бакам</span>
                    </div>
                    <div className="bg-slate-950/60 backdrop-blur p-3 rounded-xl border border-slate-850 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Нагрузка секторов</span>
                        <div className="space-y-1.5 mt-2">
                          <div>
                            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                              <span>Шохмансур</span>
                              <span>87%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1">
                              <div className="bg-rose-500 h-1 rounded-full" style={{ width: '87%' }} />
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-[9px] text-slate-400 mb-0.5">
                              <span>Сино</span>
                              <span>42%</span>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-1">
                              <div className="bg-emerald-500 h-1 rounded-full" style={{ width: '42%' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-500 mt-2">Обновлено: только что</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* INTERACTIVE DEMO WIDGETS SECTION */}
        <section id="interactive-demo" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/50 relative">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col items-center text-center mb-12">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                Живая демонстрация
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-4">
                Попробуйте технологии в действии
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl text-sm sm:text-base">
                Две основные технологии нашей системы — ИИ-анализ кадра и умная маршрутизация — доступны для моментального тестирования прямо здесь.
              </p>

              {/* Tab Switcher */}
              <div className="flex p-1 bg-slate-900 rounded-xl border border-slate-850 mt-8 gap-1">
                <button
                  onClick={() => setActiveTab('camera')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'camera' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  ИИ-Камера (Сканирование)
                </button>
                <button
                  onClick={() => setActiveTab('routing')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'routing' 
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  Умная логистика (Маршрут)
                </button>
              </div>
            </div>

            {/* Widgets container */}
            <div className="max-w-4xl mx-auto bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
              
              {/* TAB 1: AI CAMERA SIMULATOR */}
              {activeTab === 'camera' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {/* Visual Screen */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden relative flex flex-col min-h-[300px]">
                    {/* Viewfinder Overlay */}
                    <div className="absolute inset-4 border border-emerald-500/15 pointer-events-none rounded-xl z-20">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                    </div>

                    <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 px-2.5 py-1 rounded flex items-center gap-1.5 z-20">
                      <Camera className="w-3 h-3 text-emerald-400" />
                      DUSHANBE_CAM_#12
                    </div>

                    {/* Camera view */}
                    <div className="flex-1 flex items-center justify-center p-6 relative">
                      {/* Laser Line Scanning Effect */}
                      {scanning && (
                        <div 
                          className="absolute left-0 right-0 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] z-20 animate-[scan_2s_infinite_linear]"
                          style={{
                            animation: 'scan 1.5s infinite linear'
                          }}
                        />
                      )}

                      {/* Mock Container visual */}
                      <div className="w-32 h-40 bg-slate-900 border border-slate-800 rounded-t-2xl rounded-b-lg relative flex flex-col justify-end p-2 shadow-inner">
                        {/* Custom container handle */}
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-3 bg-slate-800 rounded-full border border-slate-700" />
                        
                        {/* Trash Level representation */}
                        <div 
                          className={`w-full transition-all duration-1000 ease-out rounded-xs ${
                            selectedPreset === 'empty' 
                              ? 'h-[12%] bg-emerald-500/20 border-t border-emerald-400/50' 
                              : selectedPreset === 'medium'
                              ? 'h-[48%] bg-amber-500/20 border-t border-amber-400/50'
                              : 'h-[92%] bg-rose-500/25 border-t border-rose-400/50'
                          }`}
                        >
                          {/* Inner wave pulse */}
                          <div className={`absolute inset-x-0 bottom-0 top-auto h-full opacity-30 animate-pulse ${
                            selectedPreset === 'empty' 
                              ? 'bg-emerald-500' 
                              : selectedPreset === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`} />
                        </div>

                        {/* AI Detection Bounding Box */}
                        {scanResultReady && (
                          <div 
                            className={`absolute inset-x-1 bottom-1 border-2 rounded-lg p-2 flex flex-col justify-between transition-all duration-300 z-10 ${
                              selectedPreset === 'empty'
                                ? 'border-emerald-500 bg-emerald-500/5 top-28'
                                : selectedPreset === 'medium'
                                ? 'border-amber-500 bg-amber-500/5 top-14'
                                : 'border-rose-500 bg-rose-500/5 top-2'
                            }`}
                          >
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase self-start leading-none tracking-wider ${
                              selectedPreset === 'empty'
                                ? 'bg-emerald-500 text-slate-950'
                                : selectedPreset === 'medium'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-rose-500 text-slate-950'
                            }`}>
                              {selectedPreset === 'empty' ? 'CONTAINER_OK' : selectedPreset === 'medium' ? 'ATTENTION' : 'OVERFLOW_ALERT'}
                            </span>
                            
                            <div className="text-right font-mono font-bold leading-none mt-auto">
                              <span className={`text-xs block ${
                                selectedPreset === 'empty' ? 'text-emerald-400' : selectedPreset === 'medium' ? 'text-amber-400' : 'text-rose-400'
                              }`}>
                                {selectedPreset === 'empty' ? '12% Заполнено' : selectedPreset === 'medium' ? '48% Заполнено' : '94% Заполнено'}
                              </span>
                              <span className="text-[7px] text-slate-400 block mt-0.5">YOLOv8 CONF: 99.2%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Indicator */}
                    {scanning && (
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 p-3 flex items-center gap-3">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <div className="flex-1 bg-slate-950 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-emerald-400 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400">{scanProgress}%</span>
                      </div>
                    )}
                  </div>

                  {/* Controller Panel */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Brain className="w-5 h-5 text-emerald-400" />
                        Симулятор ИИ-мониторинга
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Выберите состояние мусорного контейнера для камеры и запустите глубокий анализ кадра нейросетью.
                      </p>

                      {/* Presets Selectors */}
                      <div className="space-y-2.5 mt-5">
                        <label className="block text-[10px] font-bold tracking-wider uppercase text-slate-500">
                          Режим заполнения контейнера
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => { setSelectedPreset('empty'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'empty' 
                                ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400' 
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                            }`}
                          >
                            Пустой
                          </button>
                          <button
                            onClick={() => { setSelectedPreset('medium'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'medium' 
                                ? 'bg-amber-500/10 border-amber-500/35 text-amber-400' 
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                            }`}
                          >
                            Средний
                          </button>
                          <button
                            onClick={() => { setSelectedPreset('full'); setScanResultReady(false); }}
                            disabled={scanning}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                              selectedPreset === 'full' 
                                ? 'bg-rose-500/10 border-rose-500/35 text-rose-400' 
                                : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-350'
                            }`}
                          >
                            Переполнен
                          </button>
                        </div>
                      </div>

                      {/* Log Screen */}
                      <div className="mt-5 bg-slate-950 rounded-xl p-3 border border-slate-850 font-mono text-[9px] text-slate-400 h-28 overflow-y-auto space-y-1">
                        {scanLog.length === 0 ? (
                          <span className="text-slate-600 italic">Нажмите «Запустить анализ» для инициализации сканера...</span>
                        ) : (
                          scanLog.map((log, idx) => (
                            <div key={idx} className="flex gap-1.5 items-start">
                              <span className="text-emerald-500">&gt;</span>
                              <span>{log}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={startAiScan}
                      disabled={scanning}
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {scanning ? 'Идет сканирование...' : 'Запустить анализ ИИ'}
                      {!scanning && <Play className="w-3.5 h-3.5 fill-current" />}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: SMART ROUTE PLANNER */}
              {activeTab === 'routing' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  {/* Visual Screen Map */}
                  <div className="bg-slate-950 rounded-2xl border border-slate-850 overflow-hidden relative flex flex-col min-h-[300px]">
                    <div className="absolute top-3 left-3 bg-slate-900/80 border border-slate-800 text-[10px] text-slate-400 px-2.5 py-1 rounded flex items-center gap-1.5 z-20">
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      ГИС-МАРШРУТ // СЕКТОР #03
                    </div>

                    {/* Interactive Map Grid */}
                    <div className="flex-1 relative bg-slate-950 p-4 flex items-center justify-center">
                      {/* Grid background */}
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-35" />

                      {/* Map Nodes (Dushanbe bins) */}
                      <div className="absolute inset-0 z-10 p-6 flex flex-col justify-between">
                        {/* Dispatch base */}
                        <div className="absolute top-[80%] left-[10%] flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20">
                            <Truck className="w-4 h-4" />
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">База ГУП</span>
                        </div>

                        {/* Node 1: Green (Clean) */}
                        <div className="absolute top-[60%] left-[30%] flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[8px] font-bold">
                            15%
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Ул. Айни</span>
                        </div>

                        {/* Node 2: Red (Full) */}
                        <div className="absolute top-[35%] left-[25%] flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all duration-300 ${
                            routeStep >= 1 ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                          }`}>
                            {routeStep >= 1 ? '✓' : '88%'}
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Пр. Рудаки</span>
                        </div>

                        {/* Node 3: Red (Full) */}
                        <div className="absolute top-[18%] left-[60%] flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold border transition-all duration-300 ${
                            routeStep >= 2 ? 'bg-emerald-500/30 border-emerald-500 text-emerald-400' : 'bg-rose-500/20 border-rose-500 text-rose-400'
                          }`}>
                            {routeStep >= 2 ? '✓' : '92%'}
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Массив Зеленый</span>
                        </div>

                        {/* Node 4: Green (Clean) */}
                        <div className="absolute top-[55%] left-[75%] flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center text-[8px] font-bold">
                            30%
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Ул. Борбад</span>
                        </div>

                        {/* Node 5: Disposal Area */}
                        <div className="absolute top-[15%] right-[10%] flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center text-slate-950 shadow-lg ${
                            routeStep >= 3 ? 'bg-cyan-500 shadow-cyan-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}>
                            <Globe className="w-4 h-4" />
                          </div>
                          <span className="text-[7px] text-slate-400 mt-0.5">Полигон</span>
                        </div>
                      </div>

                      {/* SVG animated routing path */}
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                        {routingState !== 'idle' && (
                          <g>
                            {/* Base to Node 2 */}
                            <path 
                              d="M 124 252 L 178 148" 
                              fill="none" 
                              stroke="#34d399" 
                              strokeWidth="2" 
                              strokeDasharray="100"
                              strokeDashoffset={routeStep >= 1 ? "0" : "100"}
                              className="transition-all duration-1000 ease-in-out"
                            />
                            {/* Node 2 to Node 3 */}
                            <path 
                              d="M 178 148 L 302 96" 
                              fill="none" 
                              stroke="#34d399" 
                              strokeWidth="2" 
                              strokeDasharray="150"
                              strokeDashoffset={routeStep >= 2 ? "0" : "150"}
                              className="transition-all duration-1000 ease-in-out"
                            />
                            {/* Node 3 to Landfill */}
                            <path 
                              d="M 302 96 L 388 88" 
                              fill="none" 
                              stroke="#34d399" 
                              strokeWidth="2" 
                              strokeDasharray="100"
                              strokeDashoffset={routeStep >= 3 ? "0" : "100"}
                              className="transition-all duration-1000 ease-in-out"
                            />
                          </g>
                        )}
                      </svg>
                    </div>

                    {/* Dashboard mini bar */}
                    {routingState === 'completed' && (
                      <div className="absolute bottom-0 inset-x-0 bg-slate-900 border-t border-slate-800 p-3 text-center text-[10px] text-emerald-400 font-bold flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        МАРШРУТ ВЫПОЛНЕН: ВСЕ БАКИ ОЧИЩЕНЫ
                      </div>
                    )}
                  </div>

                  {/* Controller Panel */}
                  <div className="flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-emerald-400" />
                        Умная маршрутизация
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Система автоматически исключает полупустые баки и строит кратчайший путь для вывоза отходов.
                      </p>

                      {/* Map info card */}
                      <div className="mt-5 space-y-3">
                        <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Найдено контейнеров:</span>
                            <span className="font-bold text-slate-200">5</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Требуют очистки (&gt;70%):</span>
                            <span className="font-bold text-rose-400">2 (Пр. Рудаки, Зеленый)</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500">Пропущено чистых баков:</span>
                            <span className="font-bold text-emerald-400">2</span>
                          </div>
                        </div>

                        {/* Results stats */}
                        {routingState === 'completed' && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 space-y-2.5 animate-[fadeIn_0.3s_ease-out]">
                            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Оптимизация ИИ:</h4>
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-[10px] text-slate-500 block">Дистанция</span>
                                <span className="text-sm font-black text-slate-200">12.4 км</span>
                              </div>
                              <div className="bg-slate-950/40 p-2 rounded-lg border border-slate-850">
                                <span className="text-[10px] text-slate-500 block">Экономия ГСМ</span>
                                <span className="text-sm font-black text-emerald-400">-35%</span>
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
                          className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all border border-slate-700 cursor-pointer"
                        >
                          Сбросить симуляцию
                        </button>
                      ) : (
                        <button
                          onClick={startRouteSolver}
                          disabled={routingState === 'running'}
                          className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/5 cursor-pointer disabled:cursor-not-allowed"
                        >
                          {routingState === 'running' ? 'Расчет путей...' : 'Построить маршрут ИИ'}
                          {routingState !== 'running' && <Play className="w-3.5 h-3.5 fill-current" />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              Архитектура системы
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mt-4">
              Мощный технологический стек
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
              Комплексное цифровое решение для коммунальных служб города Душанбе, построенное на базе передовых разработок в сфере искусственного интеллекта и ГИС.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 backdrop-blur border border-slate-900 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl p-6 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Компьютерное зрение</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Сверточные нейронные сети YOLOv8 анализируют видеопотоки с камер в реальном времени, определяя уровень заполнения баков и наличие навалов мусора.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 backdrop-blur border border-slate-900 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl p-6 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <MapIcon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Интерактивная ГИС</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Электронная карта города на базе Leaflet отображает все точки сбора, их статусы заполнения и отслеживает перемещение мусоровозов в реальном времени.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 backdrop-blur border border-slate-900 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl p-6 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <Navigation className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Умные маршруты</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Алгоритмы оптимизации логистики строят наиболее экономичные маршруты объезда только для тех контейнеров, которые действительно нуждаются в очистке.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-900/40 backdrop-blur border border-slate-900 hover:border-emerald-500/30 transition-all duration-300 rounded-2xl p-6 hover:-translate-y-1 group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-colors">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Аналитика и прогнозы</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Построение графиков накопления отходов в различных секторах города позволяет прогнозировать пиковые нагрузки и оптимизировать расписания.
              </p>
            </div>
          </div>
        </section>

        {/* METRICS & EFFICIENCY SECTION */}
        <section id="metrics" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 border-t border-slate-900 bg-slate-950/20 relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Text column */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Показатели эффективности
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  Экономика и экология в балансе
                </h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Внедрение Smart Waste Dushanbe кардинально меняет подход к городскому хозяйству, снижая операционные затраты и улучшая санитарно-экологическое состояние города.
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Меньше износа техники</h4>
                      <p className="text-[11px] text-slate-400">Сокращение пробега снижает расходы на амортизацию и топливо.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
                      ✓
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Чистые улицы 24/7</h4>
                      <p className="text-[11px] text-slate-400">ИИ сразу уведомляет о переполненных баках, исключая завалы отходов.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats column */}
              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Metric card 1 */}
                <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                  <span className="text-5xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 self-start">
                    45%
                  </span>
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-200">Экономия бюджетов</h3>
                    <p className="text-xs text-slate-400 mt-1">Сокращение общих транспортных расходов благодаря оптимальной логистике.</p>
                  </div>
                </div>

                {/* Metric card 2 */}
                <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                  <span className="text-5xl font-black text-white bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 self-start">
                    99.8%
                  </span>
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-200">Точность детекции</h3>
                    <p className="text-xs text-slate-400 mt-1">Обученная на тысячах кадров нейросеть практически не совершает ошибок.</p>
                  </div>
                </div>

                {/* Metric card 3 */}
                <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
                  <span className="text-5xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 self-start">
                    &lt; 15м
                  </span>
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-200">Скорость диспетчеризации</h3>
                    <p className="text-xs text-slate-400 mt-1">Время от обнаружения переполнения бака ИИ до оповещения водителя в приложении.</p>
                  </div>
                </div>

                {/* Metric card 4 */}
                <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
                  <span className="text-5xl font-black text-white bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 self-start">
                    480т
                  </span>
                  <div className="mt-6">
                    <h3 className="text-sm font-bold text-slate-200">Снижение CO₂ выбросов</h3>
                    <p className="text-xs text-slate-400 mt-1">Сокращение вредных выхлопов благодаря оптимизированным путям спецтехники.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Trash2 className="w-4.5 h-4.5" />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              © {new Date().getFullYear()} Smart Waste Dushanbe. Все права защищены.
            </span>
          </div>

          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <a href="#features" className="hover:text-emerald-400 transition-colors">О технологии</a>
            <a href="#interactive-demo" className="hover:text-emerald-400 transition-colors">Интерактивное демо</a>
            <a href="#metrics" className="hover:text-emerald-400 transition-colors">Эффективность</a>
          </div>

          <div className="text-[10px] text-slate-600 font-mono">
            Версия 1.2.0-stable // Dushanbe Digital Initiative
          </div>
        </div>
      </footer>
    </div>
  );
}
