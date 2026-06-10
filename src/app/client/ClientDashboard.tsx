'use client';

import { useState } from 'react';
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
  XCircle, 
  Plus, 
  AlertCircle 
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

  // Handle Photo input conversion to Base64
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (base64 can be large, limit to ~3MB)
    if (file.size > 3 * 1024 * 1024) {
      setReportError('Фотография слишком большая. Пожалуйста, загрузите изображение менее 3 МБ.');
      return;
    }

    setReportError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result as string);
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
      // Append to local list
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
      
      // Reset form
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
      // Append to local list
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Trash2 className="w-5.5 h-5.5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-tight">
                Smart Waste
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase block -mt-0.5">
                Портал жителей
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700/50">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">{currentUser.name}</span>
            </div>
            
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-400 hover:text-rose-300 py-2 px-4 rounded-xl hover:bg-rose-500/5 border border-transparent hover:border-rose-500/10 transition-all cursor-pointer"
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
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-4.5 rounded-2xl space-y-1.5 shadow-xl">
            <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-3">Навигация</span>
            
            <button
              onClick={() => setActiveTab('report')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'report' 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Сообщить о свалке
            </button>

            <button
              onClick={() => setActiveTab('message')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'message' 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Написать оператору
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history' 
                  ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
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
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <MapPin className="w-5.5 h-5.5 text-emerald-400" />
                  Сообщить о новой свалке мусора
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Отправьте точный адрес, фотографию и координаты свалки, чтобы диспетчер направил мусоровоз, а админ одобрил установку нового бака.
                </p>
              </div>

              {reportSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <span>Ваше предложение успешно отправлено! Оно появится на карте после одобрения администратором.</span>
                </div>
              )}

              {reportError && (
                <div className="flex items-center gap-3 bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                  <span>{reportError}</span>
                </div>
              )}

              <form onSubmit={handleReportLocation} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form fields */}
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                      Адрес свалки / ориентир
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Например: ул. Айни, д. 45, двор школы"
                      required
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                      Описание / комментарий
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Опишите масштаб свалки, тип отходов..."
                      required
                      rows={3}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-white resize-none"
                    />
                  </div>

                  {/* Photo picker */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                      Фотография свалки
                    </label>
                    <div className="relative border border-dashed border-slate-800 hover:border-emerald-500/35 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-950/30 transition-all">
                      {photo ? (
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo} alt="Preview" className="max-h-full object-contain" />
                          <button
                            type="button"
                            onClick={() => setPhoto('')}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-slate-950/80 hover:bg-rose-500 text-slate-400 hover:text-white flex items-center justify-center text-xs border border-slate-800 cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <label className="w-full flex flex-col items-center justify-center py-6 cursor-pointer text-center">
                          <Camera className="w-8 h-8 text-slate-500 mb-2.5 group-hover:text-emerald-400" />
                          <span className="text-xs font-semibold text-slate-300">Загрузить снимок</span>
                          <span className="text-[10px] text-slate-500 mt-1">Допускается JPG/PNG, до 3 МБ</span>
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
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Широта (Lat)</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={latitude}
                        disabled
                        className="w-full bg-slate-950/40 border border-slate-850 rounded-xl py-2 px-3 text-[11px] font-mono text-slate-400 mt-1"
                      />
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-500 uppercase">Долгота (Lng)</span>
                      <input
                        type="number"
                        step="0.000001"
                        value={longitude}
                        disabled
                        className="w-full bg-slate-950/40 border border-slate-850 rounded-xl py-2 px-3 text-[11px] font-mono text-slate-400 mt-1"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={reportLoading}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-950 font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/5 cursor-pointer disabled:cursor-not-allowed mt-2"
                  >
                    {reportLoading ? 'Отправка...' : 'Отправить на проверку'}
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Map picker component */}
                <div className="lg:col-span-6 flex flex-col justify-stretch">
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Отметить на карте Душанбе
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
            <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <MessageSquare className="w-5.5 h-5.5 text-emerald-400" />
                  Написать оператору системы
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  У вас есть вопросы, жалобы или отзывы по вывозу ТБО? Задайте их напрямую дежурному диспетчеру.
                </p>
              </div>

              {msgSuccess && (
                <div className="flex items-center gap-3 bg-emerald-500/15 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400 mt-6 animate-pulse">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                  <span>Сообщение успешно доставлено! Мы ответим вам в ближайшее время.</span>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="space-y-4 mt-6">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Электронная почта для уведомления (опционально)
                  </label>
                  <input
                    type="email"
                    value={msgEmail}
                    onChange={(e) => setMsgEmail(e.target.value)}
                    placeholder="mail@example.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">
                    Ваше сообщение
                  </label>
                  <textarea
                    value={msgText}
                    onChange={(e) => setMsgText(e.target.value)}
                    placeholder="Напишите детали вашего обращения..."
                    required
                    rows={5}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 text-white resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={msgLoading}
                  className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/40 text-slate-950 font-bold py-3.5 px-6 rounded-xl text-xs transition-all shadow-md shadow-emerald-500/5 cursor-pointer disabled:cursor-not-allowed"
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
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                  <MapPin className="w-5 h-5 text-emerald-400" />
                  Предложенные новые свалки / контейнеры ({locations.length})
                </h3>

                {locations.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-4">Вы еще не предлагали мест для новых контейнеров.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {locations.map((loc) => {
                      const date = new Date(loc.createdAt).toLocaleDateString();
                      return (
                        <div key={loc.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4 flex gap-4 hover:border-slate-800 transition-all">
                          {/* Photo preview */}
                          <div className="w-20 h-20 rounded-xl border border-slate-800 overflow-hidden bg-slate-900 flex-shrink-0 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={loc.photo} alt={loc.address} className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-xs text-white truncate">{loc.address}</h4>
                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase flex-shrink-0 leading-none ${
                                  loc.status === 'PENDING'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : loc.status === 'APPROVED'
                                    ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                  {loc.status === 'PENDING' ? 'На проверке' : loc.status === 'APPROVED' ? 'Одобрено' : 'Отклонено'}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">{loc.description}</p>
                            </div>
                            <div className="text-[9px] text-slate-500 flex justify-between items-center mt-2 font-mono">
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
              <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2 border-b border-slate-800/60 pb-3">
                  <MessageSquare className="w-5 h-5 text-emerald-400" />
                  Переписка с оператором ({feedbacks.length})
                </h3>

                {feedbacks.length === 0 ? (
                  <p className="text-slate-500 text-xs italic py-4">У вас нет отправленных сообщений оператору.</p>
                ) : (
                  <div className="space-y-4">
                    {feedbacks.map((fb) => {
                      const date = new Date(fb.createdAt).toLocaleDateString();
                      return (
                        <div key={fb.id} className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 space-y-3">
                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-b border-slate-900 pb-2 font-mono">
                            <span>Заявка #{fb.id.slice(-6).toUpperCase()}</span>
                            <span>{date}</span>
                          </div>
                          
                          <div className="text-xs">
                            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wide">Ваше сообщение:</span>
                            <p className="text-slate-200 mt-1">{fb.message}</p>
                          </div>

                          {/* Operator reply */}
                          <div className={`p-3 rounded-xl border text-xs ${
                            fb.reply 
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-200' 
                              : 'bg-slate-900/40 border-slate-850 text-slate-400'
                          }`}>
                            <span className={`text-[8px] font-bold block uppercase tracking-wide mb-1 ${fb.reply ? 'text-emerald-450' : 'text-slate-500'}`}>
                              Ответ диспетчера:
                            </span>
                            {fb.reply ? (
                              <p className="leading-relaxed">{fb.reply}</p>
                            ) : (
                              <p className="italic flex items-center gap-1.5 mt-0.5">
                                <Clock className="w-3.5 h-3.5 text-slate-500 animate-pulse" />
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
