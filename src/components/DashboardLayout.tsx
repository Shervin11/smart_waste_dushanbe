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
} from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

interface Container {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  overflow: boolean;
  district: string;
}

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: 'ADMIN' | 'OPERATOR' | 'DRIVER';
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const user = await getCurrentUser();
      if (!user) {
        router.push('/login');
      } else {
        setCurrentUser(user);
      }
      setLoading(false);
    }
    checkAuth();
  }, [router, pathname]);

  const handleSignOut = async () => {
    await logout();
    router.push('/login');
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
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-slate-100">
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
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-slate-900 border-r border-slate-800 p-6 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
              Smart Waste
            </h1>
            <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
              Dushanbe
            </span>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 text-slate-300">
            {currentUser.role === 'ADMIN' ? (
              <Shield className="w-5 h-5 text-emerald-400" />
            ) : (
              <User className="w-5 h-5 text-sky-400" />
            )}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-xs text-white truncate">
              {currentUser.name}
            </p>
            <p className="text-[10px] text-slate-400 font-medium">
              {currentUser.role === 'ADMIN'
                ? 'Администратор'
                : currentUser.role === 'OPERATOR'
                  ? 'Оператор'
                  : 'Водитель'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-all duration-200 w-full mt-auto"
        >
          <LogOut className="w-5 h-5" />
          Выйти из системы
        </button>
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-950/80 backdrop-blur-sm">
          <div className="flex flex-col w-72 h-full bg-slate-900 border-r border-slate-800 p-6 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-extrabold text-base tracking-tight text-white leading-none">
                    Smart Waste
                  </h1>
                  <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    Dushanbe
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3.5 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-700 text-slate-300">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-xs text-white">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {currentUser.role}
                </p>
              </div>
            </div>

            <nav className="flex-1 space-y-1.5">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500 text-slate-950 font-semibold shadow-lg shadow-emerald-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={handleSignOut}
              className="flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/5 hover:text-rose-300 transition-all duration-200 w-full mt-auto"
            >
              <LogOut className="w-5 h-5" />
              Выйти
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="flex md:hidden items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-extrabold text-sm tracking-tight text-white uppercase">
              Smart Waste
            </h1>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {currentUser.role}
          </span>
        </header>

        {/* Page children */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-950">
          {children}
        </main>
      </div>
    </div>
  );
}
