'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { replyToFeedback, approveSuggestedLocation, rejectSuggestedLocation } from '@/actions/admin';
import { 
  MessageSquare, 
  MapPin, 
  Send, 
  Clock, 
  Check, 
  X, 
  AlertCircle, 
  Calendar,
  Layers,
  CheckCircle2,
  Trash2
} from 'lucide-react';

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

interface FeedbackClientProps {
  initialFeedbacks: Feedback[];
  initialSuggestedLocations: SuggestedLocation[];
}

export default function FeedbackClient({
  initialFeedbacks,
  initialSuggestedLocations,
}: FeedbackClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'messages' | 'suggestions'>('messages');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>(initialFeedbacks);
  const [suggestions, setSuggestions] = useState<SuggestedLocation[]>(initialSuggestedLocations);
  
  // Replying state
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [replyLoading, setReplyLoading] = useState<{ [key: string]: boolean }>({});

  // Moderation state
  const [modLoading, setModLoading] = useState<{ [key: string]: 'approve' | 'reject' | null }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleReplySubmit = async (feedbackId: string) => {
    const text = replyText[feedbackId];
    if (!text || !text.trim()) return;

    setReplyLoading(prev => ({ ...prev, [feedbackId]: true }));
    const res = await replyToFeedback(feedbackId, text);

    if (res.error) {
      alert(res.error);
      setReplyLoading(prev => ({ ...prev, [feedbackId]: false }));
    } else if (res.feedback) {
      // Update local feedback
      setFeedbacks(prev => 
        prev.map(f => f.id === feedbackId ? { ...f, reply: text, status: 'REPLIED' } : f)
      );
      setReplyText(prev => ({ ...prev, [feedbackId]: '' }));
      setReplyLoading(prev => ({ ...prev, [feedbackId]: false }));
      showNotification('success', 'Ответ успешно отправлен гражданину');
    }
  };

  const handleApprove = async (id: string) => {
    setModLoading(prev => ({ ...prev, [id]: 'approve' }));
    const res = await approveSuggestedLocation(id);

    if (res.error) {
      showNotification('error', res.error);
      setModLoading(prev => ({ ...prev, [id]: null }));
    } else {
      setSuggestions(prev => 
        prev.map(s => s.id === id ? { ...s, status: 'APPROVED' } : s)
      );
      setModLoading(prev => ({ ...prev, [id]: null }));
      showNotification('success', 'Место одобрено! Новый контейнер создан и добавлен на карту.');
      router.refresh();
    }
  };

  const handleReject = async (id: string) => {
    setModLoading(prev => ({ ...prev, [id]: 'reject' }));
    const res = await rejectSuggestedLocation(id);

    if (res.error) {
      showNotification('error', res.error);
      setModLoading(prev => ({ ...prev, [id]: null }));
    } else {
      setSuggestions(prev => 
        prev.map(s => s.id === id ? { ...s, status: 'REJECTED' } : s)
      );
      setModLoading(prev => ({ ...prev, [id]: null }));
      showNotification('success', 'Предложение отклонено.');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Обращения граждан</h2>
          <p className="text-slate-400 text-sm mt-1">
            Модерация предложений по новым бакам и ответы на сообщения от жителей Душанбе
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'messages' 
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Сообщения ({feedbacks.length})
          </button>
          <button
            onClick={() => setActiveTab('suggestions')}
            className={`flex items-center gap-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'suggestions' 
                ? 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/10' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Предложенные свалки ({suggestions.length})
          </button>
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className={`flex items-center gap-3 border rounded-xl p-4 text-sm max-w-xl animate-[fadeIn_0.2s_ease-out] shadow-xl ${
          notification.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
            : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* TAB 1: CITIZEN FEEDBACKS */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Поступившие обращения
          </h3>

          {feedbacks.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <MessageSquare className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">Нет входящих обращений</p>
              <p className="text-xs text-slate-500 mt-1">Здесь будут отображаться сообщения от жителей</p>
            </div>
          ) : (
            <div className="space-y-6">
              {feedbacks.map((fb) => {
                const date = new Date(fb.createdAt).toLocaleString();
                const isReplied = fb.status === 'REPLIED';

                return (
                  <div key={fb.id} className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 space-y-4 hover:border-slate-800 transition-all">
                    {/* Message Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-extrabold text-sm text-white">{fb.name}</h4>
                        {fb.email && <span className="text-[10px] text-slate-450 font-semibold">{fb.email}</span>}
                      </div>
                      <div className="flex items-center gap-2.5 font-mono text-[9px] text-slate-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{date}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          isReplied 
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {isReplied ? 'Отвечено' : 'Ожидает'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="bg-slate-900/60 border border-slate-850/50 p-4 rounded-xl text-xs text-slate-300 leading-relaxed">
                      {fb.message}
                    </div>

                    {/* Reply Section */}
                    {isReplied ? (
                      <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 text-xs text-slate-200">
                        <span className="text-[8px] font-bold text-emerald-400 uppercase block tracking-wider mb-1">
                          Ответ оператора:
                        </span>
                        <p>{fb.reply}</p>
                      </div>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <textarea
                          placeholder="Введите текст вашего ответа гражданину..."
                          value={replyText[fb.id] || ''}
                          onChange={(e) => setReplyText(prev => ({ ...prev, [fb.id]: e.target.value }))}
                          rows={3}
                          className="w-full bg-slate-950 border border-slate-850 rounded-xl py-3 px-4 text-xs placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 text-white resize-none"
                        />
                        <button
                          onClick={() => handleReplySubmit(fb.id)}
                          disabled={replyLoading[fb.id] || !replyText[fb.id]?.trim()}
                          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-550 font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                        >
                          {replyLoading[fb.id] ? 'Отправка...' : 'Отправить ответ'}
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CITIZEN SUGGESTED DUMP SITES */}
      {activeTab === 'suggestions' && (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 p-6 rounded-2xl shadow-xl space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800/60 pb-3">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Предложения новых контейнерных площадок
          </h3>

          {suggestions.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <MapPin className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-400">Нет предложенных площадок</p>
              <p className="text-xs text-slate-500 mt-1">Здесь будут отображаться свалки, о которых сообщили жители</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suggestions.map((loc) => {
                const date = new Date(loc.createdAt).toLocaleDateString();
                const isPending = loc.status === 'PENDING';
                const isApproved = loc.status === 'APPROVED';

                return (
                  <div key={loc.id} className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-800 transition-all gap-4">
                    <div className="space-y-4">
                      {/* Top Bar */}
                      <div className="flex justify-between items-center gap-3">
                        <span className="text-[10px] text-slate-500 font-mono font-bold">Свалка #{loc.id.slice(-6).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                          isPending 
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                            : isApproved
                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 animate-pulse'
                            : 'bg-rose-500/10 text-rose-450 border border-rose-500/20'
                        }`}>
                          {isPending ? 'На модерации' : isApproved ? 'Одобрено' : 'Отклонено'}
                        </span>
                      </div>

                      {/* Photo preview */}
                      <div className="w-full aspect-video rounded-xl border border-slate-800 bg-slate-900 overflow-hidden relative flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={loc.photo} alt={loc.address} className="h-full w-full object-cover" />
                      </div>

                      {/* Content details */}
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                          <MapPin className="w-4.5 h-4.5 text-emerald-450 flex-shrink-0" />
                          {loc.address}
                        </h4>
                        <p className="text-xs text-slate-350 bg-slate-900/40 p-3 rounded-lg border border-slate-850/50 leading-relaxed">{loc.description}</p>
                      </div>

                      {/* Meta */}
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                        <span>Дата: {date}</span>
                        <span>Координаты: {loc.latitude}, {loc.longitude}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {isPending ? (
                      <div className="flex gap-3 pt-3 border-t border-slate-900">
                        <button
                          onClick={() => handleApprove(loc.id)}
                          disabled={modLoading[loc.id] !== undefined}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold py-2.5 px-4 rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:cursor-not-allowed"
                        >
                          {modLoading[loc.id] === 'approve' ? 'Создание бака...' : 'Одобрить бак'}
                          {modLoading[loc.id] !== 'approve' && <Check className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleReject(loc.id)}
                          disabled={modLoading[loc.id] !== undefined}
                          className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-750 text-rose-400 font-bold py-2.5 px-4 rounded-xl text-xs transition-all cursor-pointer disabled:opacity-50"
                        >
                          {modLoading[loc.id] === 'reject' ? 'Отклонение...' : 'Отклонить'}
                          {modLoading[loc.id] !== 'reject' && <X className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-slate-900 flex items-center justify-center text-[10px] text-slate-500 font-semibold gap-1.5 bg-slate-900/20 p-2.5 rounded-xl border border-slate-850/50">
                        {isApproved ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                            <span>ПЛОЩАДКА ОДОБРЕНА И УСТАНОВЛЕНА В СИСТЕМЕ</span>
                          </>
                        ) : (
                          <>
                            <X className="w-4 h-4 text-rose-400" />
                            <span>ОБРАЩЕНИЕ ОТКЛОНЕНО</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
