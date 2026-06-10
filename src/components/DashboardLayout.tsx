'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getCurrentUser, logout } from '@/actions/auth';
import { useTheme } from '@/components/ThemeProvider';
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
  Moon
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
  const { theme, toggleTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    {
      name: 'Панель управления',
      href: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      name: 'Интерактивная карта',
      href: '/map',
      icon: Map,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      name: 'Камеры & Загрузка',
      href: '/cameras',
      icon: Camera,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      name: 'Контейнеры',
      href: '/containers',
      icon: Trash2,
      roles: ['ADMIN', 'OPERATOR'],
    },
    {
      name: 'Маршруты вывоза',
      href: '/routes',
      icon: Navigation,
      roles: ['ADMIN', 'OPERATOR', 'DRIVER'],
    },
    {
      name: 'Обращения граждан',
      href: '/feedback',
      icon: MessageSquare,
      roles: ['ADMIN', 'OPERATOR'],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground transition-colors duration-300">
        <div className="flex flex-col items-center gap-4">
          <Activity className="h-10 w-10 animate-pulse text-emerald-500" />
          <p className="text-sm font-medium tracking-wider text-slate-400">
            Загрузка Smart Waste Dushanbe...
          </p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 flex-shrink-0 transition-colors duration-300">
        
        {/* Logo & Theme Toggle */}
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-550 dark:text-emerald-400">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white leading-none">
                Smart Waste
              </h1>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
                Dushanbe
              </span>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-950 transition-colors cursor-pointer"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-650 dark:text-slate-300">
            {currentUser.role === 'ADMIN' ? (
              <Shield className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            ) : (
              <User className="w-5 h-5 text-sky-500 dark:text-sky-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-xs text-slate-800 dark:text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              {currentUser.role === 'ADMIN'
                ? 'Администратор'
                : currentUser.role === 'OPERATOR'
                  ? 'Оператор'
                  : 'Водитель'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-205 ${
                  isActive
                    ? 'bg-emerald-500 text-white font-extrabold shadow-md shadow-emerald-500/10'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/5 hover:text-rose-605 transition-all w-full mt-auto cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Выйти из системы
        </button>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col w-72 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">
                    Smart Waste
                  </h1>
                  <span className="text-[9px] font-bold text-slate-450 tracking-wider uppercase">
                    Dushanbe
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3.5 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-650 dark:text-slate-350">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-white">
                  {currentUser.name}
                </p>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <nav className="flex-1 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-950'
                    }`}
                  >
                    <Icon className="w-4.5 h-4.5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/5 hover:text-rose-600 transition-all w-full mt-auto"
            >
              <LogOut className="w-4.5 h-4.5" />
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white uppercase">
              Smart Waste
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <span className="px-2.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {currentUser.role}
            </span>
          </div>
        </header>

        {/* Page children */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
