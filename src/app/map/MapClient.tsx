'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  Filter,
  AlertTriangle,
  Trash2,
} from 'lucide-react';

const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-emerald-500 animate-spin" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2">
          Загрузка карты...
        </p>
      </div>
    </div>
  ),
});

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

interface MapClientProps {
  containers: Container[];
}

export default function MapClient({ containers }: MapClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);

  // Filters logic
  const filteredContainers = containers.filter((c) => {
    const matchesSearch =
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict =
      selectedDistrict === 'all' || c.district === selectedDistrict;

    let matchesStatus = true;
    if (selectedStatus === 'critical') {
      matchesStatus = c.fillLevel >= 80 && !c.overflow;
    } else if (selectedStatus === 'overflow') {
      matchesStatus = c.overflow;
    } else if (selectedStatus === 'normal') {
      matchesStatus = c.fillLevel < 80 && !c.overflow;
    }

    return matchesSearch && matchesDistrict && matchesStatus;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-130px)] lg:flex-row gap-6 max-w-7xl mx-auto">
      {/* Sidebar List and Filters */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-xl overflow-hidden flex-shrink-0">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Trash2 className="w-5 h-5 text-emerald-400" />
          Мониторинг площадок
        </h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Поиск по ID или адресу..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-white"
          />
        </div>

        {/* Filters Selects */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Район
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-300 focus:border-emerald-500/50"
            >
              <option value="all">Все районы</option>
              <option value="Sino">Сино</option>
              <option value="Ismoili Somoni">И. Сомони</option>
              <option value="Shohmansur">Шохмансур</option>
              <option value="Firdavsi">Фирдавси</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Статус
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-300 focus:border-emerald-500/50"
            >
              <option value="all">Все статусы</option>
              <option value="normal">Норма (&lt;80%)</option>
              <option value="critical">Заполнен (&gt;80%)</option>
              <option value="overflow">Переполнение</option>
            </select>
          </div>
        </div>

        {/* List Containers */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex justify-between">
            <span>Площадки ({filteredContainers.length})</span>
            <span>Статус</span>
          </div>

          {filteredContainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-600 text-center">
              <Filter className="w-8 h-8 text-slate-700 mb-2" />
              <p className="text-xs font-semibold">Контейнеры не найдены</p>
            </div>
          ) : (
            filteredContainers.map((container) => {
              const isSelected = selectedContainerId === container.id;

              // Border status color mapping
              let statusBorder = 'border-slate-800/80 hover:border-slate-700/80';
              let fillBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

              if (container.overflow) {
                statusBorder = isSelected ? 'border-red-600 bg-red-950/15' : 'border-red-900/50 bg-red-950/5 hover:border-red-800/50';
                fillBadgeColor = 'bg-red-600 text-white font-bold';
              } else if (container.fillLevel >= 80) {
                statusBorder = isSelected ? 'border-orange-500 bg-orange-950/10' : 'border-orange-900/30 bg-orange-950/5 hover:border-orange-800/30';
                fillBadgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20';
              } else if (isSelected) {
                statusBorder = 'border-emerald-500 bg-emerald-950/10';
              }

              return (
                <button
                  key={container.id}
                  onClick={() => setSelectedContainerId(container.id)}
                  className={`w-full text-left p-3.5 border rounded-xl flex items-center justify-between gap-4 transition-all duration-200 cursor-pointer ${statusBorder} ${
                    isSelected ? 'shadow-lg' : ''
                  }`}
                >
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-sm text-white">
                        {container.id}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-[4px] text-[8px] font-bold bg-slate-800 border border-slate-700 text-slate-400">
                        {container.district === 'Sino' ? 'Сино' : container.district === 'Ismoili Somoni' ? 'И. Сомони' : container.district === 'Shohmansur' ? 'Шохмансур' : 'Фирдавси'}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs truncate">
                      {container.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${fillBadgeColor}`}
                    >
                      {container.overflow ? (
                        <>
                          <AlertTriangle className="w-3 h-3 text-white" /> 100%+
                        </>
                      ) : (
                        `${container.fillLevel}%`
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 min-h-[400px] lg:h-full relative">
        <MapComponent
          containers={filteredContainers}
          selectedContainerId={selectedContainerId}
          onSelectContainer={setSelectedContainerId}
        />
      </div>
    </div>
  );
}
