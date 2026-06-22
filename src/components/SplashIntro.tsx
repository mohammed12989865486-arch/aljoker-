/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Users, Shield, Gamepad2, Volume2 } from 'lucide-react';
import { Dialect } from '../utils/audio';

interface SplashProps {
  onLoginSuccess: (profile: {
    id: string;
    username: string;
    avatar: string;
    level: number;
    xp: number;
    coins: number;
    isVIP: boolean;
    wins: number;
    losses: number;
    winStreak: number;
    dialect: Dialect;
  }) => void;
}

export default function SplashIntro({ onLoginSuccess }: SplashProps) {
  const [guestName, setGuestName] = useState('');
  const [customUsername, setCustomUsername] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [selectedDialect, setSelectedDialect] = useState<Dialect>('egypt');
  const [activeTab, setActiveTab] = useState<'guest' | 'google' | 'facebook' | 'register'>('guest');
  const [loading, setLoading] = useState(false);

  const handleGuestLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const uniqueId = 'gst_' + Math.floor(1000 + Math.random() * 9000);
      const name = guestName.trim() || `لاعب_${Math.floor(1000 + Math.random() * 9000)}`;
      onLoginSuccess({
        id: uniqueId,
        username: name,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${name}`,
        level: 1,
        xp: 0,
        coins: 1500, // starting coins
        isVIP: false,
        wins: 0,
        losses: 0,
        winStreak: 0,
        dialect: selectedDialect,
      });
      setLoading(false);
    }, 1200);
  };

  const handleSocialLogin = (platform: 'google' | 'facebook') => {
    setLoading(true);
    setTimeout(() => {
      const name = platform === 'google' 
        ? 'محمد الغالي' 
        : 'أبو أحمد الجوكر';
      const uniqueId = `${platform}_${Math.floor(100000 + Math.random() * 900000)}`;
      onLoginSuccess({
        id: uniqueId,
        username: name,
        avatar: platform === 'google' 
          ? 'https://api.dicebear.com/7.x/adventurer/svg?seed=Gamer1' 
          : 'https://api.dicebear.com/7.x/adventurer/svg?seed=KingJoker',
        level: 3,
        xp: 340,
        coins: 12000,
        isVIP: platform === 'google', // Mock VIP for Google login
        wins: 14,
        losses: 6,
        winStreak: 3,
        dialect: selectedDialect,
      });
      setLoading(false);
    }, 1500);
  };

  const handleRegisterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername) return;
    setLoading(true);
    setTimeout(() => {
      const uniqueId = 'usr_' + Math.floor(10000 + Math.random() * 90000);
      onLoginSuccess({
        id: uniqueId,
        username: customUsername,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${customUsername}`,
        level: 1,
        xp: 0,
        coins: 2500,
        isVIP: false,
        wins: 0,
        losses: 0,
        winStreak: 0,
        dialect: selectedDialect,
      });
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4 font-sans relative overflow-hidden select-none">
      {/* Background radial gold glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md z-10 text-center"
      >
        {/* Animated Custom Logo Image */}
        <div className="relative inline-block mb-5 mt-4">
          <motion.div 
            animate={{ scale: [1, 1.025, 1], rotate: [0, 0.5, -0.5, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-44 h-44 mx-auto p-1.5 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-600 shadow-[0_0_50px_rgba(245,158,11,0.45)] flex items-center justify-center relative overflow-hidden"
          >
            <img 
              src="/joker_logo.jpg" 
              className="w-full h-full rounded-full object-cover border-4 border-slate-950/80 shadow-[inset_0_4px_12px_rgba(255,255,255,0.25)] filter brightness-110 contrast-105" 
              alt="شعار لعبة الجوكر"
              referrerPolicy="no-referrer"
            />
          </motion.div>
          {/* Glowing badge */}
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] px-2.5 py-0.5 rounded-full font-black shadow-lg animate-pulse">
            الموسم الأول 🏆
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 bg-clip-text text-transparent">
          لعبة كوتشينة الجوكر
        </h1>
        <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
          المنصة العربية الأولى لألعاب الترنيب والورق التفاعلي مع البث الصوتي المباشر والبطولات الحماسية!
        </p>

        {/* Dialect sound selector */}
        <div className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-3 mb-6 shadow-xl text-right">
          <label className="text-xs font-bold text-amber-400 mb-2 flex items-center justify-end gap-1">
            <span>اختر المعلق الصوتي المفضل لك</span>
            <Volume2 size={14} className="text-amber-500" />
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { key: 'egypt', label: '🇪🇬 مصري', tag: 'يا باشا' },
              { key: 'gulf', label: '🇸🇦 خليجي', tag: 'يا الربع' },
              { key: 'levant', label: '🇸🇾 شامي', tag: 'يا شريك' },
            ].map((d) => (
              <button
                key={d.key}
                onClick={() => setSelectedDialect(d.key as Dialect)}
                className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border flex flex-col items-center justify-center ${
                  selectedDialect === d.key
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-lg'
                    : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span>{d.label}</span>
                <span className="text-[10px] text-slate-500 font-light mt-0.5">{d.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-1.5 flex gap-1 mb-5">
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guest' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            دخول سريع
          </button>
          <button
            onClick={() => setActiveTab('register')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            حساب خاص
          </button>
          <button
            onClick={() => setActiveTab('google')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'google' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            جوجل
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'facebook' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            فيسبوك
          </button>
        </div>

        {/* Login Form Wrapper */}
        <div className="bg-slate-900/85 border border-slate-800 rounded-3xl p-6 shadow-2xl relative">
          {loading && (
            <div className="absolute inset-0 bg-slate-900/90 rounded-3xl flex flex-col items-center justify-center z-20">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-amber-400 text-xs font-bold mt-3 animate-pulse">جاري خلط الأوراق وبناء المقعد...</p>
            </div>
          )}

          {activeTab === 'guest' && (
            <div className="flex flex-col text-right">
              <p className="text-slate-400 text-xs mb-4">
                تتيح لك ميزة الدخول السريع بدء اللعب فوراً وبنقرة واحدة. سيقوم التطبيق بإنشاء ملف تعريف محلي لك مع توكنز مجانية!
              </p>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">اسم مستعار للاعب (اختياري)</label>
                <input
                  type="text"
                  placeholder="مثال: ذيب_البراري / لاعب_1"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 text-right font-bold"
                />
              </div>
              <button
                onClick={handleGuestLogin}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-400 hover:from-amber-500 hover:to-amber-300 text-slate-950 font-bold py-3 px-4 rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Gamepad2 size={16} />
                <span>العب كزائر الآن</span>
              </button>
            </div>
          )}

          {activeTab === 'register' && (
            <form onSubmit={handleRegisterLogin} className="flex flex-col text-right">
              <p className="text-slate-400 text-xs mb-3">أنشئ يوزر فريد لحفظ مستواك والتوكنز في المتجر والمنافسة بالبطولات.</p>
              
              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">اسم مستخدم فريد</label>
                <input
                  type="text"
                  required
                  placeholder="The_Joker_99"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-left font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-300 mb-1">بريدك الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="name@domain.com"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-left font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-300 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-left font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 transform active:scale-95"
              >
                <Sparkles size={16} />
                <span>إنشاء الحساب وبدء المغامرة</span>
              </button>
            </form>
          )}

          {activeTab === 'google' && (
            <div className="flex flex-col text-center">
              <p className="text-slate-400 text-xs mb-5">يربط حسابك ببريد Gmail لحفظ وتخزين المقتنيات، التوكنز، ومستواك الدائم بضغطة واحدة.</p>
              <button
                onClick={() => handleSocialLogin('google')}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 transform active:scale-95 mb-4"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.59 5.59 0 0 1 8.4 12.914a5.59 5.59 0 0 1 5.59-5.59c2.257 0 4.148 1.258 5.12 3.109l3.52-2.032A11.16 11.16 0 0 0 13.99 4a11.18 11.18 0 0 0-11.18 11.18A11.18 11.18 0 0 0 13.99 26.36c6.262 0 11.18-4.509 11.18-11.18 0-.6-.057-1.171-.16-1.714H12.24z"/>
                </svg>
                <span>تسجيل الدخول الذكي بـ Google</span>
              </button>
            </div>
          )}

          {activeTab === 'facebook' && (
            <div className="flex flex-col text-center">
              <p className="text-slate-400 text-xs mb-5">ميزة استراتيجية ممتازة لقراءة الأصدقاء وتحديهم مباشرة على طاولات الجوكر الخاصة!</p>
              <button
                onClick={() => handleSocialLogin('facebook')}
                className="w-full bg-[#1877F2] hover:bg-[#165fc9] text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 transform active:scale-95 mb-4"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
                <span>تسجيل الدخول بـ Facebook</span>
              </button>
            </div>
          )}
        </div>

        {/* Feature badges footers */}
        <div className="grid grid-cols-3 gap-3 mt-8">
          <div className="flex flex-col items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl p-2.5">
            <Trophy className="text-amber-500 mb-1" size={16} />
            <span className="text-[10px] font-bold">بطولات كبرى</span>
          </div>
          <div className="flex flex-col items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl p-2.5">
            <Users className="text-emerald-400 mb-1" size={16} />
            <span className="text-[10px] font-bold">مجتمع متفاعل</span>
          </div>
          <div className="flex flex-col items-center bg-slate-900/50 border border-slate-800/60 rounded-2xl p-2.5">
            <Shield className="text-blue-400 mb-1" size={16} />
            <span className="text-[10px] font-bold">توزيع عادل عشوائي</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
