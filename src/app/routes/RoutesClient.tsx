'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/actions/auth';
import {
  Navigation,
  User,
  Clock,
  CheckCircle2,
  Play,
  Check,
  MapPin,
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

interface RoutesClientProps {
  initialTasks: Task[];
  drivers: { id: string; name: string; username: string }[];
}

export default function RoutesClient({
  initialTasks,
  drivers,
}: RoutesClientProps) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; username: string; role: string } | null>(null);
  const [selectedDriverForTask, setSelectedDriverForTask] = useState<{ [taskId: string]: string }>({});
  const prevInitialTasksRef = useRef(initialTasks);

  useEffect(() => {
    async function loadUser() {
      const user = await getCurrentUser();
      setCurrentUser(user);
    }
    loadUser();
  }, []);

  const tasks = initialTasks;
  
  // Update ref when initialTasks changes
  useEffect(() => {
    prevInitialTasksRef.current = initialTasks;
  }, [initialTasks]);

  const handleAssignDriver = async (taskId: string, driverId: string) => {
    try {
      const res = await fetch('/api/tasks/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, driverId }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Ошибка назначения водителя');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка соединения');
    }
  };

  const handleUpdateStatus = async (taskId: string, status: string) => {
    try {
      const res = await fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, status }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert('Ошибка обновления статуса');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка соединения');
    }
  };

  if (!currentUser) return null;

  const isDriver = currentUser.role === 'DRIVER';

  // Driver specific view
  const driverTasks = tasks.filter(
    (t) => t.driver?.id === currentUser.id && t.status !== 'COMPLETED'
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          Маршруты и Задания
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {isDriver
            ? 'Просмотр назначенных контейнеров на вывоз и управление статусом'
            : 'Управление распределением заявок на вывоз мусора по водителям'}
        </p>
      </div>

      {isDriver ? (
        /* Driver View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Driver Active Tasks */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-400" />
                Ваши текущие задания ({driverTasks.length})
              </h3>

              {driverTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mb-3" />
                  <p className="text-sm font-semibold text-slate-300">
                    У вас нет активных заданий
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Новые задания появятся после распределения оператором
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {driverTasks.map((task) => {
                    const isPending = task.status === 'PENDING';
                    const isInProgress = task.status === 'IN_PROGRESS';

                    return (
                      <div
                        key={task.id}
                        className={`p-5 border rounded-2xl space-y-4 transition-all duration-300 ${
                          isInProgress
                            ? 'border-sky-500 bg-sky-950/10'
                            : 'border-slate-800 bg-slate-900/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white text-base">
                              {task.containerId}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 border border-slate-700 text-slate-400">
                              {task.container.district === 'Sino' ? 'Сино' : task.container.district === 'Ismoili Somoni' ? 'И. Сомони' : task.container.district === 'Shohmansur' ? 'Шохмансур' : 'Фирдавси'}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              task.priority === 'CRITICAL'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            }`}
                          >
                            Приоритет: {task.priority}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-slate-300 text-sm flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                            <span>{task.container.address}</span>
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span>Создано: {new Date(task.createdAt).toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Status update buttons */}
                        <div className="pt-2 flex gap-3">
                          {isPending && (
                            <button
                              onClick={() =>
                                handleUpdateStatus(task.id, 'IN_PROGRESS')
                              }
                              className="flex-1 flex items-center justify-center gap-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-sky-500/5"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" /> Начать
                              сбор мусора
                            </button>
                          )}
                          {isInProgress && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'COMPLETED')}
                              className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-emerald-500/5"
                            >
                              <Check className="w-4 h-4 stroke-[3]" /> Отметить
                              выполненным
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Driver Static Info Route */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">
                Сводка для водителя
              </h3>
              <div className="space-y-4 text-xs text-slate-400">
                <p>
                  Каждое выполненное задание автоматически обновляет систему
                  мониторинга:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Заполненность бака сбрасывается в 0%</li>
                  <li>Предупреждение о переполнении снимается</li>
                  <li>Оператор системы видит очищенный бак на карте</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Operator/Admin View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Active tasks monitoring table */}
          <div className="lg:col-span-8 bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col">
            <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-400" />
              Очередь заявок на вывоз
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Бак</th>
                    <th className="pb-3">Адрес</th>
                    <th className="pb-3 text-center">Приоритет</th>
                    <th className="pb-3 text-center">Статус</th>
                    <th className="pb-3">Водитель</th>
                    <th className="pb-3 text-right pr-2">Назначение</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40">
                  {tasks.map((task) => {
                    const isCompleted = task.status === 'COMPLETED';

                    return (
                      <tr
                        key={task.id}
                        className={`hover:bg-slate-900/20 transition-colors ${
                          isCompleted ? 'opacity-55' : ''
                        }`}
                      >
                        <td className="py-4 font-bold text-white pl-2">
                          {task.containerId}
                        </td>
                        <td className="py-4 text-slate-300 max-w-[150px] truncate">
                          {task.container.address}
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-[4px] text-[8px] font-bold border ${
                              task.priority === 'CRITICAL'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                : task.priority === 'HIGH'
                                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                  : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="py-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-[6px] text-[10px] font-semibold border ${
                              task.status === 'PENDING'
                                ? 'bg-slate-800 text-slate-300 border-slate-700'
                                : task.status === 'IN_PROGRESS'
                                  ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}
                          >
                            {task.status === 'PENDING'
                              ? 'В очереди'
                              : task.status === 'IN_PROGRESS'
                                ? 'Выполняется'
                                : 'Вывезено'}
                          </span>
                        </td>
                        <td className="py-4 text-slate-300">
                          {task.driver ? (
                            <div className="flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-slate-500" />
                              <span>{task.driver.name}</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Не назначен</span>
                          )}
                        </td>
                        <td className="py-4 text-right pr-2">
                          {!isCompleted && (
                            <div className="flex items-center justify-end gap-2">
                              <select
                                value={
                                  selectedDriverForTask[task.id] ||
                                  task.driver?.id ||
                                  ''
                                }
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setSelectedDriverForTask((prev) => ({
                                    ...prev,
                                    [task.id]: val,
                                  }));
                                  handleAssignDriver(task.id, val);
                                }}
                                className="bg-slate-950/50 border border-slate-800 rounded-lg py-1 px-2 text-[10px] text-slate-300 focus:outline-none focus:border-emerald-500/50"
                              >
                                <option value="">Назначить...</option>
                                {drivers.map((drv) => (
                                  <option key={drv.id} value={drv.id}>
                                    {drv.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Operator Statistics / Quick Assignment actions */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl">
              <h3 className="text-lg font-bold text-white mb-4">
                Сводка по логистике
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Всего заявок:</span>
                  <span className="font-bold text-white">{tasks.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Активных заявок:</span>
                  <span className="font-bold text-sky-400">
                    {tasks.filter((t) => t.status !== 'COMPLETED').length}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Свободные водители:</span>
                  <span className="font-bold text-emerald-400">
                    {drivers.length} чел.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
