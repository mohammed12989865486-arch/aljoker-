/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Hammer, RefreshCw, AlertTriangle, Play, Coins, UserCheck } from 'lucide-react';
import { UserProfile } from '../types';
import { playCoinSound } from '../utils/audio';

interface AdminPanelProps {
  userProfile: UserProfile;
  botDifficulty: 'easy' | 'medium' | 'hard';
  onUpdateCoins: (newCoins: number) => void;
  onSetBotDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
}

interface TableReport {
  id: string;
  reporter: string;
  reportedPlayer: string;
  reason: string;
  gameType: string;
  chatSnippet: string;
  status: 'pending' | 'banned' | 'dismissed';
}

export default function AdminPanelModule({
  userProfile,
  botDifficulty,
  onUpdateCoins,
  onSetBotDifficulty,
}: AdminPanelProps) {
  const [reports, setReports] = useState<TableReport[]>([
    { id: 'rep_1', reporter: 'صقر_الخليج', reportedPlayer: 'أمير_الغشاشين', reason: 'مغادرة متكررة للجولة', gameType: 'ترنيب 41', chatSnippet: 'لقد انقطع الاتصال المتكرر في منتصف كبوت حاسم', status: 'pending' },
    { id: 'rep_2', reporter: 'ابو_غازي', reportedPlayer: 'مشاكس_الهاند', reason: 'إيموجيات مزعجة مسيئة', gameType: 'بلوت', chatSnippet: 'رمى علي الطماطم والشبشب 12 مرة متتالية!', status: 'pending' },
    { id: 'rep_3', reporter: 'محبك_يا_جوكر', reportedPlayer: 'بوت_تطوير_3', reason: 'سلوك مشبوه بالرمي', gameType: 'ترنيب 61', chatSnippet: 'البوت قام بترشيح سبيت فوق الديناري بشكل غير منطقي', status: 'dismissed' }
  ]);

  const [activeTables, setActiveTables] = useState([
    { id: 'room_101', name: 'مجلس أبو حمد', players: '4 / 4', activeGame: 'ترنيب 41', rngSeed: '5f9a73c2ee' },
    { id: 'room_102', name: 'البحر المظلم', players: '4 / 4', activeGame: 'بلوت دبل', rngSeed: '7c88b0a9cd' },
    { id: 'room_103', name: 'سلاطين الشام', players: '2 / 4 (بوت تكميلي)', activeGame: 'ترنيب 61', rngSeed: '9eefb3a27a' },
  ]);

  const [simCoins, setSimCoins] = useState('5000');

  const handleActionReport = (id: string, action: 'banned' | 'dismissed') => {
    setReports(reports.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const handleSimulateCoins = () => {
    const amt = parseInt(simCoins);
    if (!isNaN(amt)) {
      onUpdateCoins(userProfile.coins + amt);
      playCoinSound();
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right select-none relative overflow-hidden">
      {/* Red Glowing Badge */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-full font-bold">
          واجهة المشرفين والأدمن
        </span>

        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-orange-400 to-amber-200">
              لوحة التحكم والإدارة الفنية
            </h2>
            <p className="text-slate-400 text-xs">راقب خادم اللعب، تفتيش البلاغات، عشوائية التوزيع، وتغيير مستويات البوت ذكاء اصطناعي.</p>
          </div>
          <div className="bg-red-500/20 text-red-400 p-2.5 rounded-2xl border border-red-500/30">
            <Shield size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel 1: Settings & simulation */}
        <div className="space-y-5">
          {/* Simulated Tokens Injector */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-end gap-1.5 mb-3">
              <span>شحن وتعديل رصيد اللاعب</span>
              <Coins size={15} className="text-yellow-500" />
            </h3>
            <p className="text-[10px] text-slate-500 mb-3 block">لحساب المطورين وتجربة شراء الطاولات وتصاميم ظهر الكوتشينة بالمتجر.</p>
            <div className="flex gap-2">
              <button
                onClick={handleSimulateCoins}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                شحن الآن
              </button>
              <input
                type="number"
                value={simCoins}
                onChange={(e) => setSimCoins(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-center text-white focus:outline-none"
              />
            </div>
          </div>

          {/* AI Difficulty Selector */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center justify-end gap-1.5 mb-2">
              <span>مستوى ذكاء البوتات الاصطناعية</span>
              <Hammer size={15} className="text-amber-400" />
            </h3>
            <p className="text-[10px] text-slate-500 mb-3 block text-right">
              يؤثر على طريقة اتخاذ القرار والمزايدة في لعبة الترنيب ولعب الأوراق الرابحة.
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { key: 'easy', label: 'مبتدئ' },
                { key: 'medium', label: 'متوسط' },
                { key: 'hard', label: 'الجوكر الباشا' },
              ].map((diff) => (
                <button
                  key={diff.key}
                  onClick={() => onSetBotDifficulty(diff.key as any)}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    botDifficulty === diff.key
                      ? 'bg-red-500/30 border-red-500 text-white shadow'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* RNG certified status */}
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono border border-emerald-500/10">
                مؤمن عشوائي
              </span>
              <h3 className="text-sm font-bold text-slate-100">خلط الأوراق (RNG Certified)</h3>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed text-right">
              حالة تشفير التوزيع: <span className="font-mono text-amber-500 font-bold text-xs">Mersenne-Twister / SHA-256</span>. يضمن عشوائية توزيع الكروت 100% ومنع الغش والتواطؤ.
            </p>
          </div>
        </div>

        {/* Panel 2: Table reports / Ban List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-slate-100 mb-3 flex items-center justify-end gap-1.5">
              <span>شكاوى وبلاغات غرف اللعب المباشرة</span>
              <AlertTriangle size={15} className="text-red-400 animate-bounce" />
            </h3>

            <div className="space-y-3 overflow-y-auto max-h-[280px] pr-1">
              {reports.map((rep) => (
                <div key={rep.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex flex-col justify-between md:flex-row gap-3">
                  {/* Actions buttons */}
                  <div className="flex md:flex-col justify-center gap-1.5 min-w-[100px]">
                    {rep.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleActionReport(rep.id, 'banned')}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg transition-all cursor-pointer"
                        >
                          تأكيد وحظر المسيء
                        </button>
                        <button
                          onClick={() => handleActionReport(rep.id, 'dismissed')}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] py-1 px-2.5 rounded-lg transition-all"
                        >
                          بلاغ كاذب / إهمال
                        </button>
                      </>
                    ) : (
                      <span className={`text-[11px] font-bold py-1 px-2 text-center rounded-lg ${
                        rep.status === 'banned' ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {rep.status === 'banned' ? 'تم الحظر والمقاطعة' : 'تم الرفض والتجاهل'}
                      </span>
                    )}
                  </div>

                  {/* Text details */}
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                        {rep.gameType}
                      </span>
                      <h4 className="text-xs font-bold text-slate-200">
                        {rep.reporter} <span className="text-slate-500">بلّغ عن</span> {rep.reportedPlayer}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      السبب: <span className="text-amber-500 font-bold">{rep.reason}</span>
                    </p>
                    <p className="text-[10px] text-zinc-500 italic mt-1 font-sans">
                      💬 "{rep.chatSnippet}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
