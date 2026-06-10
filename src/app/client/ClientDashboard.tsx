'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { logout } from '@/actions/auth';
import { submitFeedback, submitSuggestedLocation } from '@/actions/client';
import { 
  Trash2, 
  User, 
  LogOut, 
  MapPin, 
  Camera,
  MessageSquare, 
  History, 
  Send, 
  CheckCircle2, 
  Clock,
  Plus, 
  AlertCircle,
  Sun,
  Moon
} from 'lucide-react';

// Dynamically import MapPickerComponent to avoid SSR errors
const MapPickerComponent = dynamic(() => import('@/components/MapPickerComponent'), { ssr: false });

interface UserSession {
  id: string;
  name: string;
  username: string;
  role: string;
}

interface Feedback {
  id: string;
  name: string;
  email: string | null;
  message: string;
  reply: string | null;
  status: string;
  createdAt: string;
}

interface SuggestedLocation {
  id: string;
  address: string;
  description: string;
  photo: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: string;
}

interface ClientDashboardProps {
  currentUser: UserSession;
  initialFeedbacks: Feedback[];
  initialSuggestedLocations: SuggestedLocation[];
}

export default function ClientDashboard({
  currentUser,
  initialFeedbacks,
  initialSuggestedLocations,
}: ClientDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'report' | 'message' | 'history'>('report');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const themeInitialized = useRef(false);

  // Theme Controller
  useEffect(() => {
    if (themeInitialized.current) return;
    themeInitialized.current = true;
    
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
  
  // Feedbacks state
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [msgText, setMsgText] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [msgLoading, setMsgLoading] = useState(false);

  // Suggested Locations state
  const [locations, setLocations] = useState<SuggestedLocation[]>(initialSuggestedLocations);
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [latitude, setLatitude] = useState(38.56);
  const [longitude, setLongitude] = useState(68.78);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleSignOut = async () => {
    await logout();
    router.push('/');
  };

  // Canvas-based image resizing and compression
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReportError('');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Compress to JPEG with 0.7 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhoto(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Submit suggestion
  const handleReportLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      setReportError('Пожалуйста, загрузите фотографию свалки.');
      return;
    }

    setReportLoading(true);
    setReportError('');
    
    const res = await submitSuggestedLocation(address, description, photo, latitude, longitude);
    
    if (res.error) {
      setReportError(res.error);
      setReportLoading(false);
    } else if (res.location) {
      setReportSuccess(true);
      const newLoc: SuggestedLocation = {
        id: res.location.id,
        address: res.location.address,
        description: res.location.description,
        photo: res.location.photo,
        latitude: res.location.latitude,
        longitude: res.location.longitude,
        status: res.location.status,
        createdAt: new Date().toISOString(),
      };
      setLocations(prev => [newLoc, ...prev]);
      
      setAddress('');
      setDescription('');
      setPhoto('');
      setReportLoading(false);
      setTimeout(() => setReportSuccess(false), 5000);
    }
  };

  // Submit Feedback / message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgLoading(true);

    const res = await submitFeedback(currentUser.name, msgEmail || null, msgText);

    if (res.error) {
      alert(res.error);
      setMsgLoading(false);
    } else if (res.feedback) {
      setMsgSuccess(true);
      const newFb: Feedback = {
        id: res.feedback.id,
        name: res.feedback.name,
        email: res.feedback.email,
        message: res.feedback.message,
        reply: res.feedback.reply,
        status: res.feedback.status,
        createdAt: new Date().toISOString(),
      };
      setFeedbacks(prev => [newFb, ...prev]);

      setMsgText('');
      setMsgEmail('');
      setMsgLoading(false);
      setTimeout(() => setMsgSuccess(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden transition-colors duration-300">
      
      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-200/80 dark:border-slate-900 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-550 dark:text-emerald-450">
              <Trash2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Smart Waste
              </span>
              <span className="text-[10px] text-emerald-650 dark:text-emerald-400 font-semibold tracking-wider uppercase block -mt-0.5">
                Портал жителей
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <User className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-250">{currentUser.name}</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-500 hover:text-rose-600 py-2.5 px-4 rounded-xl hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full relative z-10 flex flex-col md:flex-row gap-8">
        
        {/* Navigation Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 p-4.5 rounded-2xl space-y-1.5 shadow-sm">
            <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3 mb-3">Навигация</span>
            
            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'report' 
                  ? 'bg-emerald-500 text-white font-black shadow-md' 
                  : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Сообщить о свалке
            </button>

            <button
              onClick={() => setActiveTab('message')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'message' 
                  ? 'bg-emerald-500 text-white font-black shadow-md' 
                  : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Написать оператору
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-emerald-500 text-white font-black shadow-md' 
                  : 'text-slate-550 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/40'
              }`}
            >
              <History className="w-4 h-4" />
              Мои обращения ({locations.length + feedbacks.length})
            </button>
          </div>
        </aside>

        {/* Content area */}
        <div className="flex-1">
          
          {/* TAB 1: REPORT DUMP */}
          {activeTab === 'report' && (
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <div>
                <h2 className="text-xl font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5.5 h-5.5 text-emerald-500 dark:text-emerald-450" />
                  Сообщить о новой свалке мусора
                </h2>
                <p className="text-slate-500 dark:text-slate-450 text-xs mt-1">
                  Отправьте адрес, фотографию и координаты свалки на карте Душанбе для установки нового бака или вывоза ТБО.
                </p>
              </div>

              {reportSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Ваше предложение успешно отправлено! Оно появится на общей карте после проверки.</span>
                </div>
              )}

              {reportError && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-550 dark:text-rose-405">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{reportError}</span>
                </div>
              )}

              <form onSubmit={handleReportLocation} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form fields */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                      Адрес свалки / ориентир
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Например: ул. Айни, д. 45, двор школы"
                      required
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-slate-800 dark:text-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                      Описание / комментарий
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Опишите примерный объем мусора..."
                      required
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-slate-800 dark:text-white resize-none transition-colors"
                    />
                  </div>

                  {/* Photo picker with canvas resizing */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                      Фотография свалки
                    </label>
                    <div className="relative border border-dashed border-slate-350 dark:border-slate-800 hover:border-emerald-500/35 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/30 transition-all">
                      {photo ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="Preview" className="max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setPhoto('')}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-900/80 hover:bg-rose-500 text-white flex items-center justify-center text-xs border border-transparent cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="w-full flex flex-col items-center justify-center py-6 cursor-pointer text-center">
                          <Camera className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2.5" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">Загрузить снимок</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Изображение автоматически сожмется</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePhotoChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Широта (Lat)</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase">Долгота (Lng)</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        disabled
                        className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-850 rounded-xl py-2.5 px-3 text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {reportLoading ? 'Отправка...' : 'Отправить на проверку'}
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Map picker component */}
                <div className="lg:col-span-6 flex flex-col justify-stretch">
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                    Отметить координаты на карте
                  </label>
                  <div className="flex-1 min-h-[300px]">
                    <MapPickerComponent
                      onSelectLocation={(lat, lng) => {
                        setLatitude(Number(lat.toFixed(6)));
                        setLongitude(Number(lng.toFixed(6)));
                      }}
                      initialLat={latitude}
                      initialLng={longitude}
                    />
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 2: WRITE TO OPERATOR */}
          {activeTab === 'message' && (
            <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-slate-850 dark:text-white flex items-center gap-2">
                  <MessageSquare className="w-5.5 h-5.5 text-emerald-500 dark:text-emerald-450" />
                  Написать оператору системы
                </h2>
                <p className="text-slate-500 dark:text-slate-450 text-xs mt-1">
                  У вас есть жалобы, предложения или вопросы по графику вывоза? Отправьте обращение оператору.
                </p>
              </div>

              {msgSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-600 dark:text-emerald-400 mt-6 animate-pulse">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>Сообщение доставлено оператору! Мы скоро ответим вам в истории обращений.</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-4 mt-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                    Электронная почта для уведомления (опционально)
                  </label>
                  <input
                    type="email"
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    placeholder="mail@example.com"
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-slate-800 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase mb-2">
                    Ваше сообщение
                  </label>
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Напишите детали вашего обращения..."
                    required
                    rows={5}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-4 text-xs placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-slate-800 dark:text-white resize-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={msgLoading}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/40 text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed"
                >
                  {msgLoading ? 'Отправка...' : 'Отправить обращение'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-8">
              {/* Proposed places */}
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <MapPin className="w-5 h-5 text-emerald-500 dark:text-emerald-450" />
                  Ваши предложения новых контейнеров ({locations.length})
                </h3>

                {locations.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-xs italic py-4">Вы еще не отправляли заявок на установку баков.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locations.map((loc) => {
                      const date = new Date(loc.createdAt).toLocaleDateString();
                      return (
                        <div key={loc.id} className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 flex gap-4 hover:border-slate-350 dark:hover:border-slate-800 transition-all shadow-inner">
                          {/* Photo preview */}
                          <div className="w-20 h-20 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={loc.photo} alt={loc.address} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-xs text-slate-800 dark:text-white truncate">{loc.address}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase flex-shrink-0 leading-none ${
                                  loc.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                    : loc.status === 'APPROVED'
                                    ? 'bg-emerald-550/10 text-emerald-650 dark:text-emerald-400 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-405 border border-rose-500/20'
                                }`}>
                                  {loc.status === 'PENDING' ? 'На проверке' : loc.status === 'APPROVED' ? 'Одобрено' : 'Отклонено'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{loc.description}</p>
                            </div>
                            <div className="text-[9px] text-slate-400 dark:text-slate-500 flex justify-between items-center mt-2 font-mono">
                              <span>{date}</span>
                              <span>{loc.latitude}, {loc.longitude}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Feedbacks list */}
              <div className="bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-850 dark:text-white mb-5 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <MessageSquare className="w-5 h-5 text-emerald-500 dark:text-emerald-450" />
                  Переписка с оператором ({feedbacks.length})
                </h3>

                {feedbacks.length === 0 ? (
                  <p className="text-slate-400 dark:text-slate-500 text-xs italic py-4">У вас нет отправленных сообщений оператору.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb) => {
                      const date = new Date(fb.createdAt).toLocaleDateString();
                      return (
                        <div key={fb.id} className="bg-white/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-850 rounded-2xl p-4.5 space-y-3">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-900 pb-2 font-mono">
                            <span>Заявка #{fb.id.slice(-6).toUpperCase()}</span>
                            <span>{date}</span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="text-[9px] text-slate-400 dark:text-slate-550 font-bold block uppercase tracking-wide">Ваше сообщение:</span>
                            <p className="text-slate-700 dark:text-slate-200 mt-1">{fb.message}</p>
                          </div>

                          {/* Operator reply */}
                          <div className={`p-3 rounded-xl border text-xs ${
                            fb.reply 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-800 dark:text-slate-200' 
                              : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400'
                          }`}>
                            <span className={`text-[8px] font-bold block uppercase tracking-wide mb-1 ${fb.reply ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-550'}`}>
                              Ответ диспетчера:
                            </span>
                            {fb.reply ? (
                              <p className="leading-relaxed">{fb.reply}</p>
                            ) : (
                              <p className="italic flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-slate-400 animate-pulse" />
                                Ожидает рассмотрения...
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
