'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/actions/auth';
import {
  LayoutDashboard,
  Map,
  Trash2,
  Navigation,
  LogOut,
  User,
  Shield,
  Activity,
  Menu,
  X,
  Camera,
  MessageSquare,
  Sun,
  Moon,
  ChevronRight,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER' | 'CLIENT';
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

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

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
      } else if (user.role === 'CLIENT') {
        router.push('/client');
      } else {
        setCurrentUser(user as UserSession);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  const navItems = [
    { name: 'Панель управления', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'OPERATOR'] },
    { name: 'Интерактивная карта', href: '/map', icon: Map, roles: ['ADMIN', 'OPERATOR'] },
    { name: 'Камеры & Загрузка', href: '/cameras', icon: Camera, roles: ['ADMIN', 'OPERATOR'] },
    { name: 'Контейнеры', href: '/containers', icon: Trash2, roles: ['ADMIN', 'OPERATOR'] },
    { name: 'Маршруты вывоза', href: '/routes', icon: Navigation, roles: ['ADMIN', 'OPERATOR', 'DRIVER'] },
    { name: 'Обращения граждан', href: '/feedback', icon: MessageSquare, roles: ['ADMIN', 'OPERATOR'] },
  ];

  const roleLabels: Record<string, string> = {
    ADMIN: 'Администратор',
    OPERATOR: 'Оператор',
    DRIVER: 'Водитель',
    CLIENT: 'Житель',
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'text-emerald-400',
    OPERATOR: 'text-sky-400',
    DRIVER: 'text-violet-400',
    CLIENT: 'text-amber-400',
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-slate-950 text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse shadow-xl shadow-emerald-500/30">
              <Trash2 className="w-6 h-6 text-slate-900 dark:text-white" />
            </div>
          </div>
          <p className="text-sm font-semibold tracking-widest text-slate-500 dark:text-slate-500 uppercase animate-pulse">
            Загрузка...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  const SidebarContent = () => (
    <>
      {/* Logo + theme */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-900 dark:text-white shadow-lg shadow-emerald-500/25">
            <Trash2 className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-white leading-none">
              Smart Waste
            </h1>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-widest uppercase">
              Dushanbe
            </span>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          id="sidebar-theme-toggle"
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* User card */}
      <div className="flex items-center gap-3 bg-slate-100/70 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 mb-7">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 flex-shrink-0">
          {currentUser.role === 'ADMIN'
            ? <Shield className="w-5 h-5 text-emerald-500" />
            : <User className="w-5 h-5 text-sky-400" />
          }
        </div>
        <div className="overflow-hidden flex-1">
          <p className="font-bold text-xs text-slate-800 dark:text-white truncate">{currentUser.name}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${roleColors[currentUser.role]}`}>
            {roleLabels[currentUser.role]}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5">
        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest px-3 pb-2">Навигация</p>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-900 dark:text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : ''}`} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-500 hover:bg-rose-500/8 hover:text-rose-500 dark:hover:text-rose-400 transition-all w-full cursor-pointer group"
        >
          <LogOut className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          Выйти из системы
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 flex-shrink-0 transition-colors duration-300">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div className="absolute inset-0 bg-white dark:bg-slate-950/70 backdrop-blur-sm" />
          <div
            className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button
              id="mobile-sidebar-open"
              onClick={() => setIsMobileOpen(true)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20">
                <Trash2 className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
              </div>
              <h1 className="font-black text-sm tracking-tight text-slate-900 dark:text-white uppercase">
                Smart Waste
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 ${roleColors[currentUser.role]}`}>
              {roleLabels[currentUser.role]}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
