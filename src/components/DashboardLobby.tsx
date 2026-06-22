/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, RotateCcw, Award, Coins, ShieldAlert, Star, Users, Gamepad2, 
  ShoppingCart, HelpCircle, User, LayoutGrid, Check, Plus, AlertCircle, 
  Sparkles, Download, Settings, Radio, Send, BookOpen, Trophy, Compass, Bell, Shield
} from 'lucide-react';
import { UserProfile, QuizQuest, TournamentMatch } from '../types';
import StoreModule from './StoreModule';
import ClubsModule from './ClubsModule';
import AdminPanelModule from './AdminPanelModule';
import { playCoinSound, playTimerTickSound } from '../utils/audio';

interface LobbyProps {
  userProfile: UserProfile;
  botDifficulty: 'easy' | 'medium' | 'hard';
  activeTableBg: string;
  activeDeckBg: string;
  onSelectGame: (gameType: string) => void;
  onUpdateCoins: (newCoins: number) => void;
  onUpdateVIP: (isVIP: boolean) => void;
  onJoinClub: (clubId: string, name: string) => void;
  onLeaveClub: () => void;
  onEquipTable: (id: string) => void;
  onEquipDeck: (id: string) => void;
  onSetBotDifficulty: (diff: 'easy' | 'medium' | 'hard') => void;
}

export default function DashboardLobby({
  userProfile,
  botDifficulty,
  activeTableBg,
  activeDeckBg,
  onSelectGame,
  onUpdateCoins,
  onUpdateVIP,
  onJoinClub,
  onLeaveClub,
  onEquipTable,
  onEquipDeck,
  onSetBotDifficulty,
}: LobbyProps) {
  // Tabs correspond exactly to the bottom bar in the image:
  // - 'store'
  // - 'games'
  // - 'lobby' (Home / Principal viewport)
  // - 'clubs'
  // - 'events' (Daily Spin & Tournaments list)
  const [activeTab, setActiveTab] = useState<'lobby' | 'store' | 'games' | 'clubs' | 'events'>('lobby');
  
  const [matchmakingProgress, setMatchmakingProgress] = useState<number | null>(null);
  const [matchmakingText, setMatchmakingText] = useState('');
  const [privateRoomName, setPrivateRoomName] = useState('');
  const [privateRoomPass, setPrivateRoomPass] = useState('');
  const [sharedRoomCode, setSharedRoomCode] = useState<string | null>(null);

  // Daily Spin wheel states
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinResult, setSpinResult] = useState<string | null>(null);
  const [spinClaimed, setSpinClaimed] = useState(() => {
    return localStorage.getItem('joker_spin_claimed_date') === new Date().toDateString();
  });

  // Daily Quests
  const [quests, setQuests] = useState<QuizQuest[]>([
    { id: 'q_1', textAr: 'فُز بجولة واحدة في طاولات الترنيب 41 السريعة', rewardCoins: 350, progress: userProfile.wins > 0 ? 1 : 0, target: 1, completed: false },
    { id: 'q_2', textAr: 'تصفح متجر المقتنيات لتعديل مظهر الورق الخاص بك', rewardCoins: 100, progress: 1, target: 1, completed: false },
    { id: 'q_3', textAr: 'انضم أو أسس رابطة نوادي لتحصل على شارة التعاون', rewardCoins: 250, progress: userProfile.clubId ? 1 : 0, target: 1, completed: false },
  ]);

  // Tournament tree structure data 
  const [tournamentMatches] = useState<TournamentMatch[]>([
    { id: 'tm_1', round: 1, player1: 'صقر_الشام', player2: 'ملك_الهاند', score1: 41, score2: 23, winner: 'صقر_الشام', isUserMatch: false },
    { id: 'tm_2', round: 1, player1: userProfile.username, player2: 'عاصف_البلوت', score1: 41, score2: 38, winner: userProfile.username, isUserMatch: true },
    { id: 'tm_3', round: 1, player1: 'الذيب_السعودي', player2: 'عبودة_تريكس', score1: 29, score2: 41, winner: 'عبودة_تريكس', isUserMatch: false },
    { id: 'tm_4', round: 1, player1: 'بنت_الأكابر', player2: 'بشا_مصر', score1: 41, score2: 12, winner: 'بنت_الأكابر', isUserMatch: false },
    
    { id: 'tm_5', round: 2, player1: 'صقر_الشام', player2: userProfile.username, isUserMatch: true },
    { id: 'tm_6', round: 2, player1: 'عبودة_تريكس', player2: 'بنت_الأكابر', isUserMatch: false },
  ]);

  // Handle Matchmaking Simulation
  const runQuickMatchmaking = (gameType: string) => {
    if (matchmakingProgress !== null) return;
    setMatchmakingProgress(0);
    setMatchmakingText('جاري الإتصال بخادم الجوكر السحابي...');

    let steps = [
      'جاري فحص نزاهة الـ RNG لخلط عادل...',
      'البحث عن مقاعد متاحة من فئة مستواك...',
      'العثور على خصوم! جاري دعوة صقر الرافدين 🦅 وطه الجوكر...',
      'بناء المقاعد الآمنة وتوجيه الورقة الأولى...'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < steps.length) {
        setMatchmakingProgress((prev) => (prev ? prev + 25 : 25));
        setMatchmakingText(steps[currentStep]);
        playTimerTickSound();
      } else {
        clearInterval(interval);
        setMatchmakingProgress(null);
        onSelectGame(gameType); // launch table game
      }
    }, 1200);
  };

  const spinTheWheel = () => {
    if (spinClaimed || isSpinning) return;
    setIsSpinning(true);
    
    const sectors = [100, 200, 500, 1000, 300, 50];
    const targetIndex = Math.floor(Math.random() * sectors.length);
    const degreePerSector = 360 / sectors.length;
    const targetDegree = 360 * 5 + (targetIndex * degreePerSector) + 15;

    setWheelRotation(targetDegree);
    
    let soundInterval = setInterval(() => {
      playTimerTickSound();
    }, 150);

    setTimeout(() => {
      clearInterval(soundInterval);
      setIsSpinning(false);
      const prize = sectors[targetIndex];
      onUpdateCoins(userProfile.coins + prize);
      playCoinSound();
      setSpinResult(`مبروك! ربحت ${prize} توكنز ذهب مبارك!`);
      setSpinClaimed(true);
      localStorage.setItem('joker_spin_claimed_date', new Date().toDateString());
    }, 3500);
  };

  const createPrivateRoom = () => {
    const rCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSharedRoomCode(rCode);
    playCoinSound();
  };

  const handleClaimQuest = (questId: string, reward: number) => {
    setQuests(quests.map(q => q.id === questId ? { ...q, completed: true } : q));
    onUpdateCoins(userProfile.coins + reward);
    playCoinSound();
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md mx-auto min-h-screen bg-[#111115] text-[#e2e8f0] pb-24 text-right select-none font-sans relative flex flex-col justify-between overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.85)] border-x border-slate-900">
      
      {/* 1. Header (MATCHING IMAGE SCREENSHOT EXACTLY) */}
      <div className="px-4 pt-3 pb-2 bg-[#17171d] border-b border-white/5 flex flex-col gap-2 shadow-lg">
        
        {/* Top Icon Actions */}
        <div className="flex items-center justify-between">
          {/* Top Left Icons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert('إضفاء طابع اللعب واللمسات يتم حفظها تلقائياً على هاتفك!')} 
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Settings size={20} />
            </button>
            <button 
              onClick={() => alert('مذياع دردشة الطاولات وتأثيرات الصوت تفاعلية بالكامل 📻')} 
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Radio size={20} />
            </button>
          </div>

          {/* Screen Title */}
          <span className="text-amber-400 text-xs font-black tracking-widest uppercase">الجوكر VIP</span>

          {/* Top Right Icons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => alert('مشاركة الطاولة النشطة وإرسال الأكواد للأصدقاء!')} 
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Send size={19} className="rotate-45" />
            </button>
            <button 
              onClick={() => alert('الأصدقاء المتصلون حالياً بالجوكر: 24 لاعب متصل!')} 
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <Users size={19} />
            </button>
          </div>
        </div>

        {/* Level & Currency Pills */}
        <div className="flex items-center justify-between gap-1 mt-1 font-sans">
          
          {/* User Profile Progress pill */}
          <div className="flex items-center gap-2 bg-[#121217] border border-white/5 pl-2 pr-1 py-1 rounded-full shadow-inner max-w-[155px] overflow-hidden flex-1">
            <img 
              src={userProfile.avatar || "https://api.dicebear.com/7.x/bottts/svg?seed=JokerDefault"} 
              className="w-8 h-8 rounded-full bg-slate-950 border border-amber-500/30 p-0.5 object-cover" 
              alt="Avatar" 
            />
            <div className="text-right flex-1 min-w-0">
              <span className="block text-[9px] font-bold text-white truncate text-right">
                {userProfile.username || 'لاعب_الجوكر'}
              </span>
              <div className="flex items-center gap-1 justify-end">
                {/* Level Tag badge */}
                <span className="bg-amber-500 text-slate-950 w-3.5 h-3.5 rounded-full text-[8.5px] font-black flex items-center justify-center">
                  {userProfile.level}
                </span>
                <span className="text-[7.5px] text-slate-400 font-extrabold font-mono">51%</span>
              </div>
            </div>
            {/* Small Plus button */}
            <button 
              onClick={() => alert('تفقد مستواك الحالي وزِد مهارتك بإنهاء طاولات لعب لمضاعفة نقاط الـ XP!')}
              className="bg-slate-800 hover:bg-slate-700 text-amber-400 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Gold Coin Pill */}
          <div className="flex items-center gap-1.5 bg-[#121217] border border-white/5 pl-2 pr-1 py-1 rounded-full shadow-inner flex-1 justify-between max-w-[110px]">
            {/* Golden Circle Coin */}
            <div className="w-5 h-5 bg-gradient-to-tr from-amber-600 to-yellow-400 rounded-full flex items-center justify-center font-bold text-[9px] text-slate-950 shadow">
              🪙
            </div>
            <span className="text-[10px] font-mono font-black text-amber-400 tracking-wide">
              {userProfile.coins.toLocaleString()}
            </span>
            <button 
              onClick={() => {
                onUpdateCoins(userProfile.coins + 500);
                playCoinSound();
                alert('تم شحن +500 توكنز ذهبية هدية الجوكر اليومية للغرف التنافسية!');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Tarboosh/Fez premium tokens pill */}
          <div className="flex items-center gap-1 bg-[#121217] border border-white/5 pl-2 pr-1 py-1 rounded-full shadow-inner flex-1 justify-between max-w-[90px]">
            {/* Mini Fez Hat SVG Icon */}
            <div className="w-5 h-5 bg-[#be123c] rounded p-0.5 shadow flex items-center justify-center text-[11px] relative">
              🎩
              {/* Tassel */}
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
            </div>
            <span className="text-[10px] font-mono font-black text-white">
              {userProfile.isVIP ? 'VIP' : '0'}
            </span>
            <button 
              onClick={() => {
                onUpdateVIP(true);
                playCoinSound();
                alert('مبروك! تم ترقية حساب الجوكر الخاص بك إلى فئة باشا (VIP👑) بنجاح!');
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer"
            >
              +
            </button>
          </div>

        </div>
      </div>

      {/* 2. Main Scrollable Container for Active Tab Views */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        
        {/* MATCHING 'lobby' (Home) VIEWPORT */}
        {activeTab === 'lobby' && (
          <div className="space-y-4">
            
            {/* Circle promotional floating items (Offers & Invite) */}
            <div className="flex items-center justify-center gap-4 py-1">
              
              {/* Offers banner */}
              <button 
                onClick={() => setActiveTab('store')}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 p-0.5 shadow-[0_4px_15px_rgba(244,63,94,0.3)] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#17171d] rounded-full flex flex-col items-center justify-center text-xl relative">
                    🏷️
                    {/* Tiny Fez in background inside circle */}
                    <div className="absolute -bottom-1 -right-1 text-xs filter drop-shadow">🧧</div>
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300">العروض / المتجر</span>
              </button>

              {/* Invite button */}
              <button 
                onClick={() => {
                  const rCode = Math.floor(100000 + Math.random() * 900000).toString();
                  navigator.clipboard.writeText(`انضم لطاولتي بـ كود الجوكر: ${rCode}`);
                  alert('تم نسخ رابط الدعوة الخاص بك! الكود: ' + rCode);
                }}
                className="flex flex-col items-center gap-1 group cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 via-violet-600 to-cyan-500 p-0.5 shadow-[0_4px_15px_rgba(124,58,237,0.3)] group-hover:scale-105 transition-transform">
                  <div className="w-full h-full bg-[#17171d] rounded-full flex items-center justify-center text-xl">
                    📲
                  </div>
                </div>
                <span className="text-[10px] font-black text-slate-300">دعوة صديق</span>
              </button>
            </div>

            {/* AD BANNER ("FREE EVENT : Watch ads, play more!") */}
            <div className="bg-gradient-to-r from-[#1d3557] to-[#457b9d] border border-cyan-500/20 rounded-2xl p-3 flex items-center justify-between shadow-xl relative overflow-hidden">
              {/* Star dust background */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />
              <div className="absolute -bottom-2 -left-4 text-3xl opacity-20 rotate-45 select-none">🍿</div>
              
              <div className="text-right z-10 flex-1 pl-1">
                <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full shadow inline-block mb-1">
                  FREE EVENT
                </span>
                <h4 className="text-sm font-black text-white leading-tight">شاهد العروض واملأ خزنتك!</h4>
                <p className="text-[9px] text-[#f1faee] mt-0.5 font-bold">احصل على 150 ذهبة مجانية فورا عند مشاهدة إعلانات رعاة الجوكر!</p>
                <button 
                  onClick={() => {
                    onUpdateCoins(userProfile.coins + 150);
                    playCoinSound();
                    alert('مبروك! شاهدت دعوة الرعاة وحصلت على +150 توكنز مجاني!');
                  }}
                  className="mt-2 text-[8px] bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1 rounded-lg shadow-md transition-colors"
                >
                  شاهد لتربح مجاناً 📺
                </button>
              </div>

              {/* Fun guy avatar from Dicebear */}
              <div className="relative pl-2">
                <div className="w-16 h-16 bg-slate-950/40 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden">
                  <img 
                    src="https://api.dicebear.com/7.x/adventurer/svg?seed=JokerAdGuy" 
                    className="w-14 h-14 object-cover scale-110" 
                    alt="Cartoon presenter" 
                  />
                </div>
                {/* Clapperboard emoji badge */}
                <span className="absolute -top-1 -right-1 text-base">🎬</span>
              </div>
            </div>

            {/* MAIN TARNEEB CENTRAL GAME CARD WITH FANNED CARDS POPPING OUT */}
            <div className="pt-10 pb-2 relative">
              
              {/* Fanned Cards backing fanned behind container */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 flex justify-center -space-x-4 pointer-events-none z-10 select-none">
                {/* Queen */}
                <div className="w-11 h-18 bg-white border border-slate-200 rounded-lg p-1 flex flex-col justify-between font-bold text-slate-900 text-[10px] shadow-lg origin-bottom -rotate-[15deg]">
                  <div className="flex justify-between items-center text-[8px] leading-none text-zinc-900">
                    <span>Q</span>
                    <span>♠</span>
                  </div>
                  <div className="text-center text-sm text-zinc-900">♠</div>
                  <div className="text-right text-[7px] text-slate-400">ملكة</div>
                </div>
                
                {/* King */}
                <div className="w-11 h-18 bg-white border-2 border-amber-500/30 rounded-lg p-1 flex flex-col justify-between font-bold text-slate-900 text-[10px] shadow-xl origin-bottom z-10">
                  <div className="flex justify-between items-center text-[8px] leading-none text-zinc-900">
                    <span>K</span>
                    <span>♠</span>
                  </div>
                  <div className="text-center text-sm text-zinc-900">♠</div>
                  <div className="text-right text-[7px] text-slate-400">مات</div>
                </div>

                {/* Ace */}
                <div className="w-11 h-18 bg-white border border-slate-200 rounded-lg p-1 flex flex-col justify-between font-bold text-slate-905 text-[10px] shadow-lg origin-bottom rotate-[15deg]">
                  <div className="flex justify-between items-center text-[8px] leading-none text-zinc-900">
                    <span>A</span>
                    <span>♠</span>
                  </div>
                  <div className="text-center text-sm text-zinc-900">♠</div>
                  <div className="text-right text-[7px] text-slate-400">باشا</div>
                </div>
              </div>

              {/* Curved Yellow Backdrop Ribbon (MATCHING THE SCREENSHOT CURVE) */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 rounded-full filter blur-[1px] opacity-90 z-0" />

              {/* Dark Card Container */}
              <div className="bg-[#1b1c24] border border-white/5 rounded-3xl p-4 pt-10 text-center relative shadow-3xl z-20 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                
                {/* Title */}
                <h3 className="text-lg font-black text-white hover:text-amber-400 transition-colors tracking-wide font-sans">
                  ترنيب (الطلب 41)
                </h3>
                <p className="text-slate-400 text-[9.5px] mt-0.5 leading-relaxed font-sans max-w-xs mx-auto">
                  لعبة المهارة والطلب والذكاء العربي الأقوى لشراكة أسطورية!
                </p>

                {/* Main Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  
                  {/* PLAY NOW (البدء واللعب الفوري للترنيب) */}
                  <button
                    onClick={() => runQuickMatchmaking('tarneeb')}
                    className="bg-[#22c55e] hover:bg-[#16a34a] text-white p-3 rounded-2xl shadow-[0_4px_16px_rgba(34,197,94,0.3)] transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                      <Play size={20} fill="white" className="text-white ml-0.5" />
                    </div>
                    <span className="text-[11px] font-black tracking-wide font-sans mt-1">العب الآن</span>
                  </button>

                  {/* CREATE GAME (حجز طاولة خاصة جديدة مع الأصدقاء) */}
                  <button
                    onClick={createPrivateRoom}
                    className="bg-[#2a2d3c] hover:bg-[#32364a] border border-emerald-500/20 text-emerald-400 p-3 rounded-2xl shadow-xl transition-all flex flex-col items-center justify-center gap-1 group active:scale-95 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform text-xl font-bold text-emerald-400">
                      ➕
                    </div>
                    <span className="text-[11px] font-black tracking-wide font-sans mt-1">إنشاء طاولة</span>
                  </button>

                </div>

                {/* Interactive Shared Room Code display if exists */}
                {sharedRoomCode && (
                  <div className="mt-3 bg-slate-950/80 border border-emerald-500/30 p-2.5 rounded-xl text-center">
                    <span className="block text-[8.5px] text-slate-500 font-bold">كود طاولتك الخاصة المؤقت</span>
                    <p className="text-lg font-mono font-black text-emerald-400 tracking-widest my-0.5">{sharedRoomCode}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`انسخ كود طاولة الجوكر: ${sharedRoomCode}`);
                        alert('تم نسخ الكود! شاركه في جروب صديقك بـ الواتس لتلعبوا معاً!');
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-3 py-1 rounded shadow-md transition-colors w-full cursor-pointer"
                    >
                      نسخ كود الدعوة 📋
                    </button>
                  </div>
                )}

                {/* Smaller Aux Buttons under card */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/5">
                  
                  {/* Leaderboard */}
                  <button 
                    onClick={() => alert('تفقد ترتيبك العام: مستواك هو رتبة مبتدئ 🎗️')}
                    className="bg-[#1f202a] hover:bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trophy size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-bold font-sans">المتصدرون</span>
                  </button>

                  {/* Rules */}
                  <button 
                    onClick={() => alert('قوانين الترنيب 41: تتوزع الكوتشينة 13 ورقة لكل لاعب، يطلب صاحب أعلى قيمة الترنيب، ويهدف الفريقان للفوز بالجولات ومطابقة الطلب!')}
                    className="bg-[#1f202a] hover:bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <BookOpen size={14} className="text-[#3b82f6]" />
                    <span className="text-[9px] font-bold font-sans">قوانين اللعبة</span>
                  </button>

                  {/* Games List (Toggles options or informational modal) */}
                  <button 
                    onClick={() => setActiveTab('games')}
                    className="bg-[#1f202a] hover:bg-slate-800 p-2 rounded-xl text-slate-300 hover:text-white transition-all text-center flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <LayoutGrid size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-bold font-sans">قائمة الألعاب</span>
                  </button>

                </div>

              </div>
            </div>

            {/* Quick Daily Claim reminder to hold retention */}
            <div className="bg-[#13141b] border border-white/5 p-3 rounded-2xl flex items-center justify-between">
              <div className="text-right">
                <span className="text-[8px] text-slate-500 font-bold leading-none block">تذكير</span>
                <span className="text-[10px] text-slate-300 font-black leading-tight mt-0.5 block">احصد التوكنز المجانية كل 24 ساعة!</span>
              </div>
              <button 
                onClick={() => setActiveTab('events')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-900 text-[9px] font-black px-3 py-1.5 rounded-lg shadow cursor-pointer"
              >
                افتح عجلة الحظ 🎡
              </button>
            </div>

          </div>
        )}

        {/* 'games' VIEWPORT - Other card games like Baloot, Trix, Hand */}
        {activeTab === 'games' && (
          <div className="space-y-4 font-sans text-right">
            <h3 className="text-sm font-black text-amber-400 border-r-3 border-amber-500 pr-2">ألعاب ورق الكوتشينة العربية</h3>
            
            <div className="space-y-3">
              {/* Baloot */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-amber-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full font-bold">مرحلة بيتا 🌴</span>
                  <h4 className="font-black text-sm text-white">البلوت السعودية (Baloot)</h4>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">كافة تفاصيل الحكم والصن، الدبل والمشروع لثنائي ممتاز!</p>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => alert('لعبة البلوت ستتاح رسمياً في تحديث الجوكر بنظام الكلان المشترك قريباً!')} 
                    className="text-[9px] bg-amber-500 text-slate-900 font-bold px-3 py-1 rounded"
                  >
                    انظر التفاصيل
                  </button>
                </div>
              </div>

              {/* Trix */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-cyan-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-cyan-500/20 text-cyan-400 px-2.5 py-0.5 rounded-full font-bold">التخطيط قريباً ⚔️</span>
                  <h4 className="font-black text-sm text-white">التريكس شراكة وفردي</h4>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">مملكة الفردي والشركاء مع الطلبات، الكينج، البنت، والديناري!</p>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => alert('غرف التريكس تحت التطوير، شكراً لشغفكم!')} 
                    className="text-[9px] bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded"
                  >
                    تحت الفحص
                  </button>
                </div>
              </div>

              {/* Hand */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500" />
                <div className="flex items-center justify-between">
                  <span className="text-[9px] bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full font-bold">غرفة الباشاوات 🧩</span>
                  <h4 className="font-black text-sm text-white">الهاند (عادي وسعودي)</h4>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">لعبة تسقيط وترتيب المتتاليات الفنية والمجموعات الحماسية!</p>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => alert('تتوفر تذاكر الهاند لنوادي الجوكر أوتوماتيكياً بمجرد ترقيتك للمستوى 5!')} 
                    className="text-[9px] bg-slate-800 text-slate-300 font-bold px-3 py-1 rounded"
                  >
                    حالة الغرف
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 'store' VIEWPORT */}
        {activeTab === 'store' && (
          <StoreModule
            userProfile={userProfile}
            activeTableId={activeTableBg}
            activeDeckId={activeDeckBg}
            onUpdateCoins={onUpdateCoins}
            onUpdateVIP={onUpdateVIP}
            onEquipTable={onEquipTable}
            onEquipDeck={onEquipDeck}
          />
        )}

        {/* 'clubs' VIEWPORT */}
        {activeTab === 'clubs' && (
          <ClubsModule
            userProfile={userProfile}
            onJoinClub={onJoinClub}
            onLeaveClub={onLeaveClub}
          />
        )}

        {/* 'events' VIEWPORT (Daily Quest, Spin Wheel and Tournaments) */}
        {activeTab === 'events' && (
          <div className="space-y-5">
            
            {/* SPIN WHEEL REMINDER CONTAINER */}
            <div className="bg-[#17171d] border border-amber-500/20 rounded-2xl p-4 text-center">
              <h4 className="font-black text-xs text-yellow-405 mb-1 text-yellow-400 flex items-center justify-center gap-1">
                <span>عجلة الحظ اليومية الأسبوعية</span>
                <Sparkles size={12} className="text-yellow-500" />
              </h4>
              <p className="text-slate-400 text-[9px] mb-3">اضغط لتدوير العجلة لتربح ذهب طاولتك مجاناً!</p>

              {/* Wheel graphics */}
              <div className="relative w-32 h-32 mx-auto my-2 flex items-center justify-center">
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-lg z-20 pointer-events-none">🔻</span>
                <motion.div
                  animate={{ rotate: wheelRotation }}
                  transition={isSpinning ? { duration: 3.5, ease: "easeOut" } : { duration: 0 }}
                  className="w-full h-full rounded-full border-2 border-amber-500 relative overflow-hidden bg-slate-950 flex items-center justify-center"
                >
                  <div className="absolute font-sans text-[8px] font-bold text-amber-500 flex flex-col justify-between h-full py-2 rotate-0">
                    <span>1000 👑</span>
                    <span>100 🎖️</span>
                  </div>
                  <div className="absolute font-sans text-[8px] font-bold text-amber-500 flex flex-col justify-between h-full py-2 rotate-60">
                    <span>200 💰</span>
                    <span>50 🥿</span>
                  </div>
                  <div className="absolute font-sans text-[8px] font-bold text-amber-500 flex flex-col justify-between h-full py-2 rotate-120">
                    <span>500 ✨</span>
                    <span>300 ⭐</span>
                  </div>
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-[9px] text-slate-950 font-black z-10 shadow">
                    لف
                  </div>
                </motion.div>
              </div>

              {spinResult && (
                <div className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold p-1.5 rounded-xl mt-2 border border-emerald-500/10">
                  {spinResult}
                </div>
              )}

              {spinClaimed ? (
                <p className="text-[8.5px] text-slate-500 mt-2 font-bold">تم المطالبة بحظك لليوم بنجاح! عد غداً.</p>
              ) : (
                <button
                  disabled={isSpinning}
                  onClick={spinTheWheel}
                  className="w-full mt-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-[10px] py-1.5 rounded-lg hover:brightness-110 cursor-pointer"
                >
                  {isSpinning ? 'جاري الدوران...' : 'اضغط للتدوير كهدية'}
                </button>
              )}
            </div>

            {/* DAILY QUESTS LIST */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5 space-y-3">
              <h4 className="font-black text-xs text-white">المهمات اليومية وعقود الملوك</h4>
              
              <div className="space-y-2.5">
                {quests.map((qst) => {
                  const isDone = qst.progress >= qst.target;
                  return (
                    <div key={qst.id} className="bg-[#16171d] p-2.5 rounded-xl border border-white/5 text-[10px]">
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-yellow-400 font-mono font-bold whitespace-nowrap">+{qst.rewardCoins} 🪙</span>
                        <p className="text-slate-200 font-bold text-right flex-1 leading-tight">{qst.textAr}</p>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-white/5 text-[9px]">
                        {qst.completed ? (
                          <span className="text-slate-500 font-bold">✓ تم الإستلام</span>
                        ) : isDone ? (
                          <button
                            onClick={() => handleClaimQuest(qst.id, qst.rewardCoins)}
                            className="bg-yellow-500 text-slate-950 font-black px-2 py-0.5 rounded text-[8.5px]"
                          >
                            استلم الآن
                          </button>
                        ) : (
                          <span className="text-amber-500">قيد التقدم ({qst.progress}/{qst.target})</span>
                        )}
                        <span className="text-slate-500">جائزة مضمونة</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EXTRA ADMIN FOR DESTRUCTIVE ACCESS OR MODERATING */}
            <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl">
              <span className="block text-[8px] text-slate-500">لوحة المشرف الملحقة</span>
              <p className="text-[10px] text-slate-300 mt-0.5">تفقد لوحة تحكم الصعوبة وتزويد الذهب لمراجعة دقة اللعبة.</p>
              <button
                onClick={() => alert('مستوى ذكاء الخصوم مضبوط حالياً على القيمة: ' + botDifficulty)}
                className="w-full mt-2 bg-slate-800 hover:bg-slate-700 text-xs py-1.5 rounded-lg text-slate-200"
              >
                تعديل الصعوبة والتحقق
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 3. Matchmaking Overlay modal if active */}
      {matchmakingProgress !== null && (
        <div className="absolute inset-0 bg-black/95 flex items-center justify-center z-50 p-4 font-sans text-center">
          <div className="bg-[#1b1c24] border border-amber-500/30 rounded-3xl p-6 max-w-xs w-full shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h3 className="text-sm font-black text-white mb-1 leading-tight">جاري البحث بقرعة الجوكر الموثقة...</h3>
              <p className="text-slate-400 text-[10px] mb-4 min-h-[30px] font-medium leading-relaxed">{matchmakingText}</p>
              
              {/* Progress bar */}
              <div className="w-full bg-[#121217] h-1.5 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="bg-amber-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                  style={{ width: `${matchmakingProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Elegant Curved Bottom Navigation Tab bar (MATCHING THE SCREENSHOT EXACTLY WITH FLOATING JOKER HOME BUTTON) */}
      <div className="absolute bottom-0 inset-x-0 bg-[#17171d] border-t border-white/5 shadow-[0_-8px_30px_rgba(0,0,0,0.5)] pb-safe z-40">
        <div className="flex items-center justify-around h-16 relative">
          
          {/* A. STORE TAB */}
          <button
            onClick={() => setActiveTab('store')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative cursor-pointer ${
              activeTab === 'store' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={18} />
              {/* Notification red badge */}
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-3 h-3 rounded-full text-[7.5px] font-bold flex items-center justify-center animate-beat">
                1
              </span>
            </div>
            <span className="text-[8.5px] font-bold font-sans mt-1">المتجر</span>
          </button>

          {/* B. GAMES TAB */}
          <button
            onClick={() => setActiveTab('games')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              activeTab === 'games' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Gamepad2 size={18} />
            <span className="text-[8.5px] font-bold font-sans mt-1">الألعاب</span>
          </button>

          {/* C. FLOATING JESTER HOME BUTTON (STANDOUT CENTRAL VISUAL ACCENT WITH TRI-TASSEL JESTER HAT) */}
          <div className="relative -top-3 px-1 z-50">
            <button
              onClick={() => setActiveTab('lobby')}
              style={{ WebkitTapHighlightColor: 'transparent' }}
              className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-1 shadow-[0_6px_20px_rgba(245,158,11,0.45)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
            >
              <div className="w-full h-full bg-[#111115] rounded-full flex items-center justify-center relative overflow-hidden">
                {/* Custom glowing Jester Hat Vector / Emoji */}
                <span className="text-2xl filter drop-shadow animate-bounce" style={{ animationDuration: '3s' }}>
                  🤡
                </span>
                
                {/* Ring highlight */}
                <div className="absolute inset-0 border border-amber-500/50 rounded-full pointer-events-none" />
              </div>
            </button>
            {/* Labeled 'Home' or 'الرئيسية' */}
            <span className="block text-[8px] font-black text-amber-400 text-center mt-1 select-none whitespace-nowrap">
              الرئيسية
            </span>
          </div>

          {/* D. CLUBS TAB */}
          <button
            onClick={() => setActiveTab('clubs')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors cursor-pointer ${
              activeTab === 'clubs' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield size={18} />
            <span className="text-[8.5px] font-bold font-sans mt-1">النوادي</span>
          </button>

          {/* E. EVENTS / TOURNAMENTS TAB */}
          <button
            onClick={() => setActiveTab('events')}
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative cursor-pointer ${
              activeTab === 'events' ? 'text-amber-500' : 'text-slate-400 hover:text-white'
            }`}
          >
            <div className="relative">
              <Trophy size={18} />
              {/* Notification red badge */}
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white w-3 h-3 rounded-full text-[7.5px] font-bold flex items-center justify-center animate-beat">
                1
              </span>
            </div>
            <span className="text-[8.5px] font-bold font-sans mt-1">الفعاليات</span>
          </button>

        </div>
      </div>

    </div>
  );
}
