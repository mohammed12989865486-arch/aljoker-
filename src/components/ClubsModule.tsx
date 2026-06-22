/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, ShieldAlert, Award, MessageSquare, Send, Check } from 'lucide-react';
import { Club, ChatMessage, UserProfile } from '../types';

interface ClubsProps {
  userProfile: UserProfile;
  onJoinClub: (clubId: string, clubName: string) => void;
  onLeaveClub: () => void;
}

export const KNOWN_CLUBS: Club[] = [
  { id: 'club_falcons', name: 'صقور الشرق الأوسط', logo: '🦅', membersCount: 42, totalPoints: 128900, rank: 1, description: 'أقوى نوادي الترنيب والبلوت في الخليج العربي والشرق الأوسط!' },
  { id: 'club_jokers', name: 'سلاطين الجوكر', logo: '👑', membersCount: 38, totalPoints: 95400, rank: 2, description: 'تأسسنا لنكون ملوك الخلط والكبوت. الدخول للمحترفين فقط.' },
  { id: 'club_shami', name: 'فرسان الشام والرافدين', logo: '⚔️', membersCount: 30, totalPoints: 72100, rank: 3, description: 'لكل عشاق التريكس والترنيب 61. لعب نظيف ولقاءات ممتعة.' },
  { id: 'club_pyramids', name: 'أهرامات البلوت المصرية', logo: '🦁', membersCount: 25, totalPoints: 54000, rank: 4, description: 'نادي النكتة الضحكة ولعب الكوتشينة السريع والشغل التقيل المتين!' },
];

export const INITIAL_CLUB_MESSAGES: ChatMessage[] = [
  { id: 'msg_1', senderName: 'فارس_الشمال', message: 'مرحبا يا ملوك، فيه حدا بيلعب ترنيب 41 هلق؟', timestamp: '10:14' },
  { id: 'msg_2', senderName: 'بطل_البلوت', message: 'جاهز يا باشا، دقيقة وبفتح الطاولة ونعمل تحدي ديربي.', timestamp: '10:16' },
  { id: 'msg_3', senderName: 'الجوكر_ملك', message: 'قشيت إكلة البارحة بـ 12 طلب هارد، كان كابوت خرافي!', timestamp: '10:20' }
];

export default function ClubsModule({ userProfile, onJoinClub, onLeaveClub }: ClubsProps) {
  const [clubs, setClubs] = useState<Club[]>(KNOWN_CLUBS);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CLUB_MESSAGES);
  const [chatInp, setChatInp] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClubName, setNewClubName] = useState('');
  const [newClubDesc, setNewClubDesc] = useState('');
  const [newClubLogo, setNewClubLogo] = useState('🃏');

  const handleSendClubMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInp.trim()) return;

    const newMsg: ChatMessage = {
      id: 'usr_msg_' + Date.now(),
      senderName: userProfile.username,
      message: chatInp.trim(),
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMsg]);
    setChatInp('');
  };

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClubName.trim()) return;

    const createdId = 'club_custom_' + Date.now();
    const newClub: Club = {
      id: createdId,
      name: newClubName.trim(),
      logo: newClubLogo,
      membersCount: 1,
      totalPoints: 500,
      rank: clubs.length + 1,
      description: newClubDesc.trim() || 'نادي جديد للمتعة والمنافسة في ألعاب كوتشينة الجوكر!'
    };

    setClubs([...clubs, newClub]);
    onJoinClub(createdId, newClub.name);
    setShowCreateModal(false);
    setNewClubName('');
    setNewClubDesc('');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right select-none relative overflow-hidden">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        {userProfile.clubId ? (
          <button
            onClick={onLeaveClub}
            className="text-xs text-red-400 border border-red-500/20 hover:border-red-500/40 px-3 py-1.5 rounded-xl bg-red-500/10 cursor-pointer"
          >
            مغادرة النادي الحالي
          </button>
        ) : (
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-xs text-amber-400 border border-amber-500/20 hover:border-amber-400/50 px-3 py-1.5 rounded-xl bg-amber-500/10 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>تأسيس نادي جديد</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-100">
              رابطة نوادي الجوكر العتيقة
            </h2>
            <p className="text-slate-400 text-xs">تعاون مع فريقك، تبرع بالتوكنز، شارك بالشات ونادي للبطولات الجماعية!</p>
          </div>
          <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-2xl border border-emerald-500/30">
            <Users size={24} />
          </div>
        </div>
      </div>

      {/* Main Container: Joined Chat vs Join List */}
      {userProfile.clubId ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left panel: Clan Stats info */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
            <div>
              <div className="text-5xl text-center mb-3">
                {clubs.find(c => c.id === userProfile.clubId)?.logo || '🎪'}
              </div>
              <h3 className="text-xl font-extrabold text-center text-amber-400">
                {userProfile.clubName}
              </h3>
              <p className="text-slate-450 text-xs text-center mt-2 px-2 leading-relaxed">
                {clubs.find(c => c.id === userProfile.clubId)?.description || 'نرحب بجميع فرسان الجوكر العرب للعب بروح رياضية وحماسية!'}
              </p>

              <div className="border-t border-slate-800/80 my-4 pt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-slate-900 border border-slate-800/50 rounded-xl p-2.5">
                  <span className="block text-[10px] text-slate-500"> ترتيب النادي</span>
                  <span className="text-lg font-bold text-yellow-400 font-mono">
                    #{clubs.find(c => c.id === userProfile.clubId)?.rank || '9+'}
                  </span>
                </div>
                <div className="bg-slate-900 border border-slate-800/50 rounded-xl p-2.5">
                  <span className="block text-[10px] text-slate-500">عدد الأعضاء</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {clubs.find(c => c.id === userProfile.clubId)?.membersCount || 1} / 50
                  </span>
                </div>
              </div>

              <div className="bg-slate-900/50 rounded-xl p-3 text-right">
                <span className="text-[10px] text-amber-400 font-bold block mb-1">نقاط مجد النادي الإجمالية</span>
                <p className="text-xl font-extrabold font-mono text-white text-left">
                  {(clubs.find(c => c.id === userProfile.clubId)?.totalPoints || 1000).toLocaleString()} XP
                </p>
              </div>
            </div>

            <div className="mt-6 text-center text-slate-500 text-[10px] bg-slate-900 border border-slate-800 p-2 rounded-xl">
              تتم إضافة نقاط الخبرة XP لرفعة ناديك تلقائياً عند فوزك على الطاولات.
            </div>
          </div>

          {/* Right panel: Chat dialogue of the Club */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between min-h-[400px]">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-3 mb-4">
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/10">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>12 عضو نشط بالدردشة</span>
              </div>
              <h4 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                <span>شات النادي المباشر</span>
                <MessageSquare size={16} className="text-slate-400" />
              </h4>
            </div>

            {/* Chat Body messages */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 flex flex-col justify-end max-h-[300px]">
              {messages.map((m) => {
                const isMe = m.senderName === userProfile.username;
                return (
                  <div key={m.id} className={`flex flex-col ${isMe ? 'items-start' : 'items-end'}`}>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] text-slate-500 font-mono">{m.timestamp}</span>
                      <span className={`text-[10px] font-bold ${isMe ? 'text-amber-400' : 'text-slate-400'}`}>
                        {m.senderName}
                      </span>
                    </div>
                    <div className={`p-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                      isMe 
                        ? 'bg-amber-500 text-slate-950 rounded-tl-none font-medium' 
                        : 'bg-slate-900 text-slate-200 rounded-tr-none'
                    }`}>
                      {m.message}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit bar */}
            <form onSubmit={handleSendClubMessage} className="mt-4 flex gap-2 border-t border-slate-900 pt-3">
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center cursor-pointer"
              >
                <Send size={15} className="rotate-180" />
              </button>
              <input
                type="text"
                placeholder="أرسل رسالة لأعضاء النادي..."
                value={chatInp}
                onChange={(e) => setChatInp(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white text-right focus:outline-none focus:border-amber-500"
              />
            </form>
          </div>

        </div>
      ) : (
        /* If not in club, browse clubs list */
        <div>
          <p className="text-slate-400 text-xs text-right mb-4">
            تصفح قائمة النوادي واطلب الانضمام، أو أسس ناديك الخاص لجذب المغامرين العرب!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clubs.map((club) => (
              <div 
                key={club.id} 
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="bg-amber-500/10 text-amber-400 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/10 font-mono">
                    ترتيب #{club.rank}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4 className="text-base font-bold text-white flex items-center gap-1.5 justify-end">
                        <span>{club.name}</span>
                        <span className="text-xl">{club.logo}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono">{club.membersCount} / 50 عضو</p>
                    </div>
                  </div>
                </div>

                <p className="text-slate-450 text-xs text-right mb-4 line-clamp-2 leading-relaxed min-h-[36px]">
                  {club.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-900 pt-3">
                  <button
                    onClick={() => onJoinClub(club.id, club.name)}
                    className="bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-lg font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    انضمام فوري للنادي
                  </button>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">إجمالي النقاط</span>
                    <span className="text-xs font-bold font-mono text-yellow-500">{club.totalPoints.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create club modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full text-right"
          >
            <h3 className="text-xl font-bold text-white mb-2">تأسيس نادي الجوكر الجديد</h3>
            <p className="text-slate-400 text-xs mb-4">ستكون أنت زعيم النادي (الأدمن) وتتحكم بالشعار والوصف!</p>
            
            <form onSubmit={handleCreateClub} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">اسم النادي</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ذئاب الكوتشينة"
                  value={newClubName}
                  onChange={(e) => setNewClubName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white text-right focus:outline-none focus:border-amber-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">شعار النادي (حدد إيموجي)</label>
                <div className="grid grid-cols-4 gap-2">
                  {['🦅', '👑', '⚔️', '🦁', '🤡', '🃏', '🔥', '🐺'].map((ico) => (
                    <button
                      type="button"
                      key={ico}
                      onClick={() => setNewClubLogo(ico)}
                      className={`text-xl p-2 rounded-xl border transition-all ${
                        newClubLogo === ico ? 'bg-amber-500/20 border-amber-500Scale' : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {ico}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-300 font-bold mb-1.5">وصف النادي</label>
                <textarea
                  placeholder="اكتب نبذة ترحيبية قصيرة وشروط الانضمام..."
                  value={newClubDesc}
                  onChange={(e) => setNewClubDesc(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white text-right focus:outline-none focus:border-amber-500 resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs px-3.5 py-2.5 rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg transition-all"
                >
                  تأسيس النادي الآن
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
