'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  MapPin,
  Clock,
  Activity,
  Truck,
} from 'lucide-react';

interface Container {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  fillLevel: number;
  overflow: boolean;
  district: string;
  lastUpdated: string;
}

interface Task {
  id: string;
  containerId: string;
  status: string;
  priority: string;
  createdAt: string;
  completedAt: string | null;
  container: Container;
  driver: { id: string; name: string } | null;
}

interface DashboardClientProps {
  containers: Container[];
  tasks: Task[];
}

const districtLabel: Record<string, string> = {
  Sino: 'Сино',
  'Ismoili Somoni': 'И. Сомони',
  Shohmansur: 'Шохмансур',
  Firdavsi: 'Фирдавси',
};

export default function DashboardClient({ containers, tasks }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalContainers = containers.length;
  const avgFillLevel = Math.round(
    containers.reduce((acc, c) => acc + c.fillLevel, 0) / (totalContainers || 1)
  );
  const criticalCount = containers.filter((c) => c.fillLevel >= 80 || c.overflow).length;
  const overflowCount = containers.filter((c) => c.overflow).length;
  const activeEmergencies = containers.filter((c) => c.overflow);

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  const districtData = ['Sino', 'Ismoili Somoni', 'Shohmansur', 'Firdavsi'].map((district) => {
    const dc = containers.filter((c) => c.district === district);
    const avg = dc.length ? Math.round(dc.reduce((acc, c) => acc + c.fillLevel, 0) / dc.length) : 0;
    return { name: districtLabel[district] ?? district, 'Заполнение (%)': avg };
  });

  const groupData = [
    { name: '0–50% (Низкий)', value: containers.filter((c) => c.fillLevel < 50 && !c.overflow).length, color: '#10b981' },
    { name: '50–80% (Средний)', value: containers.filter((c) => c.fillLevel >= 50 && c.fillLevel < 80 && !c.overflow).length, color: '#f59e0b' },
    { name: '80–95% (Высокий)', value: containers.filter((c) => c.fillLevel >= 80 && c.fillLevel < 95 && !c.overflow).length, color: '#f97316' },
    { name: '95–100% (Критич.)', value: containers.filter((c) => c.fillLevel >= 95 && !c.overflow).length, color: '#ef4444' },
    { name: 'Переполнение', value: overflowCount, color: '#7f1d1d' },
  ].filter((g) => g.value > 0);

  if (!mounted) {
    return (
      <div className="flex-1 h-96 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center animate-pulse shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5 text-slate-900 dark:text-white" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-500 animate-pulse">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Всего баков',
      value: totalContainers,
      icon: <Trash2 className="w-5 h-5" />,
      color: 'blue',
      valueColor: 'text-slate-900 dark:text-white',
    },
    {
      label: 'Средний уровень',
      value: `${avgFillLevel}%`,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'emerald',
      valueColor: avgFillLevel >= 70 ? 'text-orange-500' : 'text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Критические (>80%)',
      value: criticalCount,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'orange',
      valueColor: criticalCount > 0 ? 'text-orange-500' : 'text-slate-900 dark:text-white',
    },
    {
      label: 'Переполнения',
      value: overflowCount,
      icon: <Truck className="w-5 h-5" />,
      color: 'red',
      valueColor: overflowCount > 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white',
    },
  ];

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 dark:text-emerald-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-500 dark:text-orange-400',
    red: 'bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400',
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Аналитическая панель</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Оперативные данные по управлению отходами в Душанбе
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl shadow-sm">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-blink" />
          <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
            Реальное время
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon, color, valueColor }) => (
          <div
            key={label}
            className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50/30 dark:to-slate-800/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <span className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest">{label}</span>
              <h3 className={`text-3xl font-black mt-1.5 ${valueColor}`}>{value}</h3>
            </div>
            <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
              {icon}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col min-h-[380px]">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Заполнение по районам</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Средний процент заполнения контейнеров</p>
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(100,116,139,0.1)" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    borderColor: 'rgba(30,41,59,0.8)',
                    borderRadius: '12px',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                  }}
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '12px' }}
                  itemStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                />
                <Bar dataKey="Заполнение (%)" radius={[6, 6, 0, 0]}>
                  {districtData.map((entry, index) => {
                    const val = entry['Заполнение (%)'];
                    const color = val >= 90 ? '#ef4444' : val >= 80 ? '#f97316' : val >= 60 ? '#f59e0b' : '#10b981';
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col min-h-[380px]">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Состояние баков</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Распределение по уровню заполнения</p>
          <div className="flex-1 w-full" style={{ minHeight: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {groupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15,23,42,0.95)',
                    borderColor: 'rgba(30,41,59,0.8)',
                    borderRadius: '12px',
                  }}
                  itemStyle={{ color: '#94a3b8', fontSize: '11px' }}
                  labelStyle={{ color: '#f8fafc', fontWeight: 'bold', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-1 gap-1.5 mt-2">
            {groupData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                  {entry.name} <span className="font-bold text-slate-600 dark:text-slate-300">({entry.value})</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts + Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Emergency alerts */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col max-h-[400px]">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${activeEmergencies.length > 0 ? 'text-rose-500 animate-pulse' : 'text-slate-500 dark:text-slate-400'}`} />
            Экстренные предупреждения
            {activeEmergencies.length > 0 && (
              <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-500 border border-rose-500/20">
                {activeEmergencies.length}
              </span>
            )}
          </h4>
          <div className="flex-1 overflow-y-auto space-y-2">
            {activeEmergencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-500 dark:text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/30 mb-2" />
                <p className="text-xs font-semibold">Все контейнеры в норме</p>
              </div>
            ) : (
              activeEmergencies.map((c) => (
                <div
                  key={c.id}
                  className="bg-rose-500/5 border border-rose-500/20 p-3.5 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-900 dark:text-white font-bold text-xs">{c.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500">
                        {districtLabel[c.district] ?? c.district}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-500 text-xs truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      {c.address}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 whitespace-nowrap animate-pulse">
                    ⚠ Переполнен
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col max-h-[400px]">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Статус заявок</h4>

          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'В очереди', value: pendingTasks, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
              { label: 'В работе', value: inProgressTasks, color: 'text-sky-500', bg: 'bg-sky-500/10' },
              { label: 'Вывезено', value: completedTasks, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} border border-slate-200/50 dark:border-slate-700/50 p-3 rounded-xl text-center`}>
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <span className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-wider">{label}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            <h5 className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Активные задачи</h5>
            {tasks.filter((t) => t.status !== 'COMPLETED').length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">Нет активных заявок</p>
            ) : (
              tasks
                .filter((t) => t.status !== 'COMPLETED')
                .map((task) => (
                  <div key={task.id} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 dark:text-white">{task.containerId}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold border ${
                          task.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          : task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 truncate max-w-[150px]">{task.container.address}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${
                      task.status === 'PENDING'
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                        : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                    }`}>
                      {task.status === 'PENDING' ? 'В очереди' : 'Выполняется'}
                    </span>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
