'use client';

import { useState } from 'react';
import { Search, Trash2, Clock } from 'lucide-react';

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

interface ContainersClientProps {
  containers: Container[];
}

export default function ContainersClient({ containers }: ContainersClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('all');

  // Filtered containers list
  const filteredContainers = containers.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDistrict =
      selectedDistrict === 'all' || c.district === selectedDistrict;
    return matchesSearch && matchesDistrict;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">
          База контейнеров
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Контроль состояния мусорных баков и мониторинг наполняемости площадок
        </p>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl overflow-hidden flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-emerald-400" />
            Таблица площадок
          </h3>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Поиск по ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-white"
              />
            </div>

            {/* District */}
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-300"
            >
              <option value="all">Все районы</option>
              <option value="Sino">Сино</option>
              <option value="Ismoili Somoni">И. Сомони</option>
              <option value="Shohmansur">Шохмансур</option>
              <option value="Firdavsi">Фирдавси</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3.5 pl-2">ID</th>
                <th className="pb-3.5">Адрес площадки</th>
                <th className="pb-3.5 text-center">Заполнение</th>
                <th className="pb-3.5 text-center">Статус</th>
                <th className="pb-3.5 text-right pr-2">Обновлен</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40">
              {filteredContainers.map((container) => {
                let fillBarColor = 'bg-emerald-500';
                let statusBadge = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                let statusText = 'Норма';

                if (container.overflow) {
                  fillBarColor = 'bg-red-700';
                  statusBadge = 'bg-red-600 text-white font-bold border-red-600';
                  statusText = '⚠️ Переполнен';
                } else if (container.fillLevel >= 80) {
                  fillBarColor = 'bg-orange-500';
                  statusBadge = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
                  statusText = 'Заполнен';
                } else if (container.fillLevel >= 50) {
                  fillBarColor = 'bg-yellow-500';
                  statusBadge = 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
                  statusText = 'Средний';
                }

                const timeStr = new Date(container.lastUpdated).toLocaleTimeString(
                  [],
                  { hour: '2-digit', minute: '2-digit' }
                );

                return (
                  <tr key={container.id} className="hover:bg-slate-900/20 group transition-colors">
                    <td className="py-4 font-bold text-white pl-2">
                      {container.id}
                    </td>
                    <td className="py-4 text-slate-300 max-w-[200px] truncate">
                      <div>{container.address}</div>
                      <span className="text-[10px] text-slate-500">
                        {container.district === 'Sino' ? 'Сино' : container.district === 'Ismoili Somoni' ? 'И. Сомони' : container.district === 'Shohmansur' ? 'Шохмансур' : 'Фирдавси'}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-16 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full rounded-full ${fillBarColor}`}
                            style={{ width: `${Math.min(container.fillLevel, 100)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-200 w-8 text-right">
                          {container.fillLevel}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-[6px] text-[10px] font-bold border ${statusBadge}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="py-4 text-right text-slate-400 pr-2 flex items-center justify-end gap-1.5 h-full">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {timeStr}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
