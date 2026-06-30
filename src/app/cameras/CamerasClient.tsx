'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  UploadCloud,
  Play,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  Video,
  X,
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

interface CamerasClientProps {
  containers: Container[];
  hasApiKey: boolean;
}

export default function CamerasClient({ containers, hasApiKey }: CamerasClientProps) {
  const router = useRouter();

  // Selected container for upload
  const [selectedContainerId, setSelectedContainerId] = useState(containers[0]?.id || '');
  const [selectedAnalysisResult, setSelectedAnalysisResult] = useState<'clean' | 'overflow'>('overflow');

  // CCTV states
  const [activeCameraId, setActiveCameraId] = useState<string | null>(null);
  const [systemTime, setSystemTime] = useState('');

  // Upload file states
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const [showBoxes, setShowBoxes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update clock for CCTV HUD
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setSystemTime(now.toLocaleString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // CCTV Mock Feeds
  const cameras = [
    {
      id: 'CAM-01',
      name: 'Камера Сино-102 (ул. Гафурова)',
      containerId: 'DUS-102',
      image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=800&q=80',
      status: 'OVERFLOW',
    },
    {
      id: 'CAM-02',
      name: 'Камера И.Сомони-104 (ул. Карамова)',
      containerId: 'DUS-104',
      image: 'https://images.unsplash.com/photo-1532996127610-5310f85348f6?auto=format&fit=crop&w=800&q=80',
      status: 'CRITICAL',
    },
    {
      id: 'CAM-03',
      name: 'Камера Сино-101 (ул. Махсум)',
      containerId: 'DUS-101',
      image: 'https://images.unsplash.com/photo-1574621125745-f07865c6c06a?auto=format&fit=crop&w=800&q=80',
      status: 'NORMAL',
    },
    {
      id: 'CAM-04',
      name: 'Камера Фирдавси-108 (ул. Джами)',
      containerId: 'DUS-108',
      image: 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?auto=format&fit=crop&w=800&q=80',
      status: 'OVERFLOW',
    },
  ];

  // File upload trigger
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setAnalysisResult(null);
    setShowBoxes(false);

    const isVideo = file.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');

    // Simulate progress bar upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFileUrl(URL.createObjectURL(file));
          setRawFile(file);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setAnalysisResult(null);
    setShowBoxes(false);

    const isVideo = file.type.startsWith('video/');
    setFileType(isVideo ? 'video' : 'image');

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedFileUrl(URL.createObjectURL(file));
          setRawFile(file);
          return 100;
        }
        return prev + 30;
      });
    }, 150);
  };

  const handleClearFile = () => {
    setUploadedFileUrl(null);
    setRawFile(null);
    setFileType(null);
    setAnalysisResult(null);
    setShowBoxes(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runAiAnalysis = async () => {
    if (!uploadedFileUrl) return;
    setAnalyzing(true);
    setAnalysisResult(null);
    setShowBoxes(false);

    const formData = new FormData();
    if (rawFile) {
      formData.append('file', rawFile);
    }
    formData.append('containerId', selectedContainerId);
    formData.append('fallbackPreset', selectedAnalysisResult);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisResult(data);
        setShowBoxes(true);
        router.refresh();
      } else {
        alert('Ошибка анализа медиафайла');
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка API');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Видеомониторинг & Загрузка медиа
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Просмотр уличных камер наблюдения и анализ пользовательских фото/видео
          </p>
        </div>
      </div>

      {/* CCTV Cameras Grid */}
      <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
          <Video className="w-5 h-5 text-emerald-400" />
          Камеры наблюдения в реальном времени (CCTV)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {cameras.map((cam) => {
            const isSelected = activeCameraId === cam.id;
            return (
              <div
                key={cam.id}
                onClick={() => setActiveCameraId(isSelected ? null : cam.id)}
                className={`relative aspect-video rounded-xl overflow-hidden border bg-white dark:bg-slate-950 cursor-pointer group transition-all duration-300 ${
                  isSelected
                    ? 'ring-2 ring-emerald-500 border-transparent md:col-span-2 md:row-span-2'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700'
                }`}
              >
                {/* Image acting as video stream */}
                <img
                  src={cam.image}
                  alt={cam.name}
                  className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />

                {/* CCTV Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50 pointer-events-none" />

                {/* HUD Top */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-center text-[10px] font-mono text-slate-500 dark:text-slate-300">
                  <span className="bg-white/90 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800 tracking-wider">
                    {cam.id}
                  </span>
                  <div className="flex items-center gap-1.5 bg-white/90 dark:bg-slate-950/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    <span>REC</span>
                  </div>
                </div>

                {/* HUD Bottom */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex justify-between items-end">
                  <div className="text-[10px] font-mono text-slate-500 dark:text-slate-300">
                    <p className="font-bold text-slate-900 dark:text-white truncate max-w-[130px] lg:max-w-none">
                      {cam.name}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[9px]">{systemTime}</p>
                  </div>
                  <span
                    className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold border ${
                      cam.status === 'OVERFLOW' || cam.status === 'CRITICAL'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {cam.status}
                  </span>
                </div>

                {/* Zoom indicator hover icon */}
                <div className="absolute inset-0 bg-slate-100/30 dark:bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="bg-white/95 dark:bg-slate-950/90 border border-slate-850 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-600 dark:text-slate-200 shadow-xl">
                    {isSelected ? 'Свернуть' : 'Развернуть'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Upload and Analysis Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Upload Zone (7 cols) */}
        <div className="lg:col-span-7 bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex flex-col min-h-[450px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-emerald-400" />
            Загрузка фото или видео с телефона / регистратора
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            Загрузите кадр для распознавания мусорного контейнера или его уровня заполненности.
          </p>

          {!uploadedFileUrl ? (
            /* Dropzone */
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 bg-slate-100/30 dark:bg-slate-950/30 hover:bg-emerald-500/2 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-300 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,video/*"
                className="hidden"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-emerald-500 animate-spin" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Загрузка файла ({uploadProgress}%)
                  </p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center shadow-lg group-hover:text-emerald-400 group-hover:border-emerald-500/20 transition-all">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">
                      Перетащите файл сюда или нажмите для выбора
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-500">
                      Поддерживаются изображения (JPG, PNG) и видео (MP4)
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Uploaded Preview with Bounding Box Overlay option */
            <div className="flex-1 flex flex-col gap-5">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center max-h-[350px] aspect-video">
                {fileType === 'image' ? (
                  <img
                    src={uploadedFileUrl}
                    alt="Upload Preview"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <video
                    src={uploadedFileUrl}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}

                {/* AI Box Overlays on user media */}
                {showBoxes && analysisResult && (analysisResult.overflow || analysisResult.fill_level >= 80) && (
                  <>
                    <div
                      className="absolute border-2 border-emerald-500 bg-emerald-500/10"
                      style={{ top: '20%', left: '25%', width: '50%', height: '60%' }}
                    >
                      <span className="absolute top-0 left-0 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 select-none">
                        waste_container: {(analysisResult.detections?.find((d: any) => d.class === 'waste_container')?.confidence * 100 || 94).toFixed(0)}%
                      </span>
                    </div>
                    <div
                      className="absolute border-2 border-orange-500 bg-orange-500/15"
                      style={{ top: '60%', left: '15%', width: '40%', height: '25%' }}
                    >
                      <span className="absolute top-0 left-0 bg-orange-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 select-none">
                        overflow_trash: {(analysisResult.detections?.find((d: any) => d.class.startsWith('overflow'))?.confidence * 100 || 86).toFixed(0)}%
                      </span>
                    </div>
                  </>
                )}

                {showBoxes && analysisResult && !analysisResult.overflow && (
                  <div
                    className="absolute border-2 border-emerald-500 bg-emerald-500/10"
                    style={{ top: '20%', left: '30%', width: '40%', height: '65%' }}
                  >
                    <span className="absolute top-0 left-0 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1.5 py-0.2 select-none">
                      waste_container: {(analysisResult.detections?.find((d: any) => d.class === 'waste_container')?.confidence * 100 || 97).toFixed(0)}%
                    </span>
                  </div>
                )}

                {/* Analyzing Loader overlay */}
                {analyzing && (
                  <div className="absolute inset-0 bg-white/90 dark:bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                    <div className="w-10 h-10 border-4 border-slate-300 dark:border-slate-700 border-t-emerald-500 rounded-full animate-spin" />
                    <div className="text-center space-y-1">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-200 uppercase tracking-widest">
                        Анализ медиа YOLOv11...
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-500 animate-pulse font-mono">
                        [СКАНИРОВАНИЕ КАДРОВ НЕЙРОСЕТЬЮ]
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className={hasApiKey ? "w-full mb-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                {/* Select pair container */}
                <div className="w-full">
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">
                    Связать с площадкой
                  </label>
                  <select
                    value={selectedContainerId}
                    onChange={(e) => setSelectedContainerId(e.target.value)}
                    className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs focus:outline-none text-slate-500 dark:text-slate-300 focus:border-emerald-500/50"
                  >
                    {containers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.id} - {c.address}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Choose simulated outcome */}
                {!hasApiKey && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-wider mb-1">
                      Имитация результата AI
                    </label>
                    <select
                      value={selectedAnalysisResult}
                      onChange={(e) => {
                        setSelectedAnalysisResult(e.target.value as any);
                        setShowBoxes(false);
                        setAnalysisResult(null);
                      }}
                      className="w-full bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500 dark:text-slate-300 focus:border-emerald-500/50"
                    >
                      <option value="clean">Норма / Пустой (10%)</option>
                      <option value="overflow">Переполнение (99%)</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleClearFile}
                  disabled={analyzing}
                  className="flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white py-3 px-4 rounded-xl text-xs font-semibold cursor-pointer disabled:opacity-50"
                >
                  <X className="w-4 h-4" /> Очистить
                </button>
                <button
                  onClick={runAiAnalysis}
                  disabled={analyzing}
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-all shadow-lg shadow-emerald-500/10 cursor-pointer disabled:opacity-50"
                >
                  <Cpu className="w-4 h-4" /> {hasApiKey ? 'Запустить ИИ-анализ (Gemini)' : 'Запустить YOLOv11 детектор (Имитация)'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* JSON Output / Activity Info (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-2xl shadow-xl flex-1 flex flex-col min-h-[300px]">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              Лог детектора YOLOv11
            </h4>

            {analysisResult ? (
              <div className="space-y-4 flex-1 flex flex-col">
                <pre className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] text-sky-300 overflow-x-auto font-mono flex-1">
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
                {analysisResult.overflow ? (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-400">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <p className="font-bold">Обнаружено критическое состояние!</p>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-[11px]">
                        Заявка на вывоз автоматически создана и добавлена в очередь маршрута.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-xs text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>Площадка чистая. Статус в базе данных обновлен.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-600 text-center py-12">
                <Cpu className="w-12 h-12 text-slate-700 dark:text-slate-800 mb-3" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-500">Ожидание загрузки файла...</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-600 mt-1 max-w-[200px]">
                  Загрузите снимок и запустите нейросеть для вывода структурированного JSON.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
