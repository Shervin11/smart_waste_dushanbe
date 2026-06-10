'use client';

import { useEffect, useState, useRef } from 'react';
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

export default function DashboardClient({ containers, tasks }: DashboardClientProps) {
  const [mounted, setMounted] = useState(false);
  const mountedRef = useRef(false);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    setMounted(true);
  }, []);

  // 1. Calculations
  const totalContainers = containers.length;
  const avgFillLevel = Math.round(
    containers.reduce((acc, c) => acc + c.fillLevel, 0) / (totalContainers || 1)
  );

  const criticalCount = containers.filter(
    (c) => c.fillLevel >= 80 || c.overflow
  ).length;

  const activeEmergencies = containers.filter(
    (c) => c.overflow
  );

  const pendingTasks = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  // 2. Chart 1 Data: District Fill Levels
  const districts = ['Sino', 'Ismoili Somoni', 'Shohmansur', 'Firdavsi'];
  const districtData = districts.map((district) => {
    const distContainers = containers.filter((c) => c.district === district);
    const avg = distContainers.length
      ? Math.round(
          distContainers.reduce((acc, c) => acc + c.fillLevel, 0) /
            distContainers.length
        )
      : 0;
    return {
      name: district === 'Sino' ? 'Сино' : district === 'Ismoili Somoni' ? 'И. Сомони' : district === 'Shohmansur' ? 'Шохмансур' : 'Фирдавси',
      'Заполнение (%)': avg,
    };
  });

  // 3. Chart 2 Data: Fill Level Groups
  const groupData = [
    { name: '0-50% (Низкий)', value: containers.filter((c) => c.fillLevel < 50 && !c.overflow).length, color: '#10b981' },
    { name: '50-80% (Средний)', value: containers.filter((c) => c.fillLevel >= 50 && c.fillLevel < 80 && !c.overflow).length, color: '#f59e0b' },
    { name: '80-95% (Высокий)', value: containers.filter((c) => c.fillLevel >= 80 && c.fillLevel < 95 && !c.overflow).length, color: '#f97316' },
    { name: '95-100% (Критич.)', value: containers.filter((c) => c.fillLevel >= 95 && !c.overflow).length, color: '#ef4444' },
    { name: 'Переполнение', value: containers.filter((c) => c.overflow).length, color: '#09090b' },
  ].filter((g) => g.value > 0);

  if (!mounted) {
    return (
      <div className="flex-1 h-96 flex items-center justify-center">
        <Clock className="w-8 h-8 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Аналитическая панель</h2>
          <p className="text-slate-400 text-sm mt-1">
            Оперативные данные по управлению отходами в Душанбе
          </p>
        </div>
        <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3.5">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-semibold tracking-wider text-slate-300 uppercase">
            Обновляется в реальном времени
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Всего баков</span>
            <h3 className="text-3xl font-black text-white mt-1.5">{totalContainers}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/5">
            <Trash2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Средний уровень</span>
            <h3 className="text-3xl font-black text-white mt-1.5">{avgFillLevel}%</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Критические (&gt;80%)</span>
            <h3 className="text-3xl font-black text-orange-400 mt-1.5">{criticalCount}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center shadow-lg shadow-orange-500/5">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl flex items-center justify-between shadow-xl">
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Переполнения</span>
            <h3 className="text-3xl font-black text-red-400 mt-1.5">
              {containers.filter(c => c.overflow).length}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-lg shadow-red-500/5">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Charts & Activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: District Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col min-h-[400px]">
          <h4 className="text-lg font-bold text-white mb-6">Средний процент заполнения по районам</h4>
          <div className="flex-1 w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ fontWeight: 'bold', color: '#f8fafc' }}
                />
                <Bar dataKey="Заполнение (%)" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {districtData.map((entry, index) => {
                    const val = entry['Заполнение (%)'];
                    let barColor = '#10b981'; // Sino green
                    if (val >= 80) barColor = '#f97316';
                    if (val >= 90) barColor = '#ef4444';
                    return <Cell key={`cell-${index}`} fill={barColor} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Pie Chart of Fill level groups */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col min-h-[400px]">
          <h4 className="text-lg font-bold text-white mb-4">Состояние баков в городе</h4>
          <div className="flex-1 w-full h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={groupData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {groupData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Custom Legends */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-[11px]">
            {groupData.map((entry, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-400 font-medium truncate">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts and Task Status Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Active emergency alerts list */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col max-h-[400px] overflow-hidden">
          <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            Экстренные предупреждения
          </h4>
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {activeEmergencies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500/20 mb-2" />
                <p className="text-xs font-semibold">Все контейнеры в норме</p>
              </div>
            ) : (
              activeEmergencies.map((c) => (
                <div
                  key={c.id}
                  className="border p-3.5 rounded-xl flex items-center justify-between gap-4 transition-colors bg-red-500/10 border-red-500/30"
                >
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-extrabold text-sm">{c.id}</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                        {c.district === 'Sino' ? 'Сино' : c.district === 'Ismoili Somoni' ? 'И. Сомони' : c.district === 'Shohmansur' ? 'Шохмансур' : 'Фирдавси'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      {c.address}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
                      ⚠️ Переполнен
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Active tasks status */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col max-h-[400px] overflow-hidden">
          <h4 className="text-lg font-bold text-white mb-4">Статус выполнения заявок</h4>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">В очереди</span>
              <p className="text-xl font-bold text-slate-200 mt-1">{pendingTasks}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">В работе</span>
              <p className="text-xl font-bold text-sky-400 mt-1">{inProgressTasks}</p>
            </div>
            <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl text-center">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Вывезено</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">{completedTasks}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Активные задачи</h5>
            {tasks.filter(t => t.status !== 'COMPLETED').length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">Нет активных заявок на вывоз</p>
            ) : (
              tasks
                .filter(t => t.status !== 'COMPLETED')
                .map((task) => (
                  <div key={task.id} className="bg-slate-950/30 border border-slate-850 p-3 rounded-xl flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{task.containerId}</span>
                        <span className={`px-1.5 py-0.2 rounded-[4px] text-[8px] font-extrabold ${
                          task.priority === 'CRITICAL' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          task.priority === 'HIGH' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="text-slate-400 truncate max-w-[150px]">{task.container.address}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        task.status === 'PENDING' ? 'bg-slate-800 text-slate-300' : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                      }`}>
                        {task.status === 'PENDING' ? 'В очереди' : 'Выполняется'}
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
