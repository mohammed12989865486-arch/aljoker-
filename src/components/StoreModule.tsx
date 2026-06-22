/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Coins, Check, CreditCard, ChevronLeft } from 'lucide-react';
import { StoreItem, UserProfile } from '../types';
import { playCoinSound } from '../utils/audio';

interface StoreProps {
  userProfile: UserProfile;
  activeTableId: string;
  activeDeckId: string;
  onUpdateCoins: (newCoins: number) => void;
  onUpdateVIP: (isVIP: boolean) => void;
  onEquipTable: (id: string) => void;
  onEquipDeck: (id: string) => void;
}

export const INITIAL_STORE_ITEMS: StoreItem[] = [
  // Tables
  { id: 'table_emerald', name: 'Emerald Forest', nameAr: 'طاولة الزمرد الكلاسيكي', type: 'table', cost: 0, styleClass: 'bg-gradient-to-b from-emerald-800 via-emerald-900 to-emerald-950', purchased: true },
  { id: 'table_velvet', name: 'Royal Velvet Red', nameAr: 'طاولة المخمل الملكي الأحمر', type: 'table', cost: 500, styleClass: 'bg-gradient-to-b from-red-950 to-red-900', purchased: false },
  { id: 'table_void', name: 'Infinite Dark Void', nameAr: 'طاولة الفراغ المظلم المطلق', type: 'table', cost: 1200, styleClass: 'bg-gradient-to-b from-slate-950 to-zinc-900', purchased: false },
  { id: 'table_gold', name: 'Imperial Golden Glow', nameAr: 'طاولة الذهب الإمبراطوري', type: 'table', cost: 3000, styleClass: 'bg-gradient-to-b from-amber-950 via-slate-950 to-amber-950', purchased: false },
  
  // Card Decks
  { id: 'deck_classic', name: 'Classic Red', nameAr: 'النمط الكلاسيكي الأحمر', type: 'card_back', cost: 0, styleClass: 'bg-gradient-to-br from-red-700 to-red-900 text-white', purchased: true },
  { id: 'deck_vip_gold', name: 'VIP Golden Joker', nameAr: 'ظهر الجوكر الذهبي الفاخر', type: 'card_back', cost: 800, styleClass: 'bg-gradient-to-br from-yellow-500 via-amber-600 to-yellow-500 text-slate-950', purchased: false },
  { id: 'deck_dark_matter', name: 'Deep Dark Matter', nameAr: 'ظهر الهيمنة المظلمة', type: 'card_back', cost: 1500, styleClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-emerald-950 text-indigo-400', purchased: false },
  { id: 'deck_neon', name: 'Neon Cyberpunk', nameAr: 'ظهر النيون السيبراني المشع', type: 'card_back', cost: 2500, styleClass: 'bg-gradient-to-br from-fuchsia-600 to-cyan-500 text-white', purchased: false },

  // Emoji Packs
  { id: 'emoji_interactive_pack', name: 'Humorous Interactives', nameAr: 'حزمة الطماطم والشبشب والقهوة السريعة', type: 'emoji_pack', cost: 0, purchased: true },
];

export default function StoreModule({
  userProfile,
  activeTableId,
  activeDeckId,
  onUpdateCoins,
  onUpdateVIP,
  onEquipTable,
  onEquipDeck,
}: StoreProps) {
  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('joker_store_items');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return INITIAL_STORE_ITEMS; }
    }
    return INITIAL_STORE_ITEMS;
  });

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const saveStoreItems = (items: StoreItem[]) => {
    setStoreItems(items);
    localStorage.setItem('joker_store_items', JSON.stringify(items));
  };

  const showToast = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleBuyItem = (item: StoreItem) => {
    if (userProfile.coins < item.cost) {
      showToast('ليس لديك ما يكفي من التوكنز! العب جولات أكثر لشحن التوكنز.', 'error');
      return;
    }

    const updated = storeItems.map(i => {
      if (i.id === item.id) {
        return { ...i, purchased: true };
      }
      return i;
    });

    onUpdateCoins(userProfile.coins - item.cost);
    saveStoreItems(updated);
    playCoinSound();
    showToast(`لقد تم شراء "${item.nameAr}" بنجاح! يمكنك تفعيلها الآن.`, 'success');
  };

  const handleBuyVIP = () => {
    if (userProfile.isVIP) {
      showToast('أنت بالفعل مشترك في نظام الباشا الـ VIP!', 'error');
      return;
    }
    
    // Simulate cost of VIP: 4000 tokens or direct purchase
    if (userProfile.coins < 2000) {
      showToast('عفواً! تبلغ رسوم تفعيل الباشا VIP قيمة 2000 توكنز.', 'error');
      return;
    }

    onUpdateCoins(userProfile.coins - 2000);
    onUpdateVIP(true);
    playCoinSound();
    showToast('مبروك! تم تفعيل اشتراك الباشا الـ VIP المذهل مع هدايا مضاعفة كليا!', 'success');
  };

  const activeTable = storeItems.find(i => i.id === activeTableId) || storeItems[0];
  const activeDeck = storeItems.find(i => i.id === activeDeckId) || storeItems[4];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-right select-none relative overflow-hidden">
      {/* Absolute Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-800 pb-5 mb-6 gap-4">
        {/* Token Balance */}
        <div className="flex items-center gap-2 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800 shadow-inner">
          <span className="text-sm font-light text-slate-400">رصيدك الحالي:</span>
          <Coins className="text-yellow-500 animate-pulse" size={20} />
          <span className="text-xl font-mono font-extrabold text-yellow-400">
            {userProfile.coins.toLocaleString()}
          </span>
          <span className="text-xs text-yellow-500/80 mr-1">توكنز</span>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h2 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-100">
              متجر الجوكر الفخم
            </h2>
            <p className="text-slate-400 text-xs">خصص طاولتك، مظهر الكوتشينة، ودرع اسمك لتصنع حضورك الأقوى!</p>
          </div>
          <div className="bg-amber-500/20 text-amber-400 p-2.5 rounded-2xl border border-amber-500/30">
            <ShoppingBag size={24} />
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          className={`px-4 py-3 rounded-2xl font-bold text-center text-xs mb-5 z-20 ${
            message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {message.type === 'success' ? '✓ ' : '⚠ '}
          {message.text}
        </motion.div>
      )}

      {/* VIP Basha Board Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-yellow-950 to-slate-950 border border-amber-500/40 rounded-3xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="md:order-last flex flex-col items-center md:items-end">
          <div className="flex items-center gap-1.5 text-yellow-400 font-extrabold text-lg">
            <span>نظام الباشا الـ VIP</span>
            <Star size={20} className="fill-yellow-400 animate-spin-slow" />
          </div>
          <p className="text-slate-200 text-xs text-center md:text-right mt-1 max-w-sm">
            احصل على شارة الباشا الذهبية المتألقة، وإلغاء الإعلانات تلقائياً، ودخول مجاني حصري للبطولات الفخمة وهدايا يومية مضروبة بـ x2!
          </p>
        </div>

        {userProfile.isVIP ? (
          <div className="bg-amber-400/20 text-amber-300 font-extrabold text-sm px-5 py-2.5 rounded-2xl border border-amber-500/40 flex items-center gap-2">
            <Check size={18} />
            <span>اشتراك الباشا مفعل مدى الحياة</span>
          </div>
        ) : (
          <button
            onClick={handleBuyVIP}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-extrabold text-xs px-5 py-3 rounded-2xl shadow-lg transition-all transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <CreditCard size={15} />
            <span>تفعيل الباشا (بقيمة 2000 توكنز)</span>
          </button>
        )}
      </div>

      {/* 2-Column Sections: Tables vs Deck Designs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Section 1: Tables */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center justify-end gap-2 border-r-4 border-amber-500 pr-3">
            <span>تخصيص خلفيات الطاولة</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">Tables</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {storeItems.filter(item => item.type === 'table').map(item => {
              const isActive = activeTableId === item.id || activeTableId === item.styleClass;
              return (
                <div 
                  key={item.id}
                  className={`bg-slate-950 border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isActive ? 'border-amber-500 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Action Button */}
                  <div>
                    {!item.purchased ? (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1"
                      >
                        <span>{item.cost}</span>
                        <Coins size={12} />
                        <span>شراء</span>
                      </button>
                    ) : isActive ? (
                      <span className="text-[11px] bg-amber-500 text-slate-950 font-extrabold px-3 py-1 rounded-xl flex items-center gap-1">
                        <Check size={12} />
                        مفعلة حالياً
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipTable(item.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        تفعيل الطاولة
                      </button>
                    )}
                  </div>

                  {/* Icon & Title info */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-white">{item.nameAr}</h4>
                      <p className="text-slate-500 text-[10px]">{item.name}</p>
                    </div>
                    {/* Visual miniature preview circle */}
                    <div className={`w-10 h-10 rounded-full border border-white/20 shadow-lg ${item.styleClass}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Cards backs */}
        <div>
          <h3 className="text-lg font-bold text-slate-100 mb-4 flex items-center justify-end gap-2 border-r-4 border-amber-500 pr-3">
            <span>تخصيص ظهر الورق</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-mono">Decks</span>
          </h3>

          <div className="grid grid-cols-1 gap-3">
            {storeItems.filter(item => item.type === 'card_back').map(item => {
              const isActive = activeDeckId === item.id || activeDeckId === item.styleClass;
              return (
                <div 
                  key={item.id}
                  className={`bg-slate-950 border rounded-2xl p-4 flex items-center justify-between transition-all ${
                    isActive ? 'border-amber-500 bg-amber-950/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Action Button */}
                  <div>
                    {!item.purchased ? (
                      <button
                        onClick={() => handleBuyItem(item)}
                        className="bg-yellow-500 hover:bg-yellow-400 text-slate-950 text-xs font-bold px-3 py-1.5 rounded-xl shadow transition-all flex items-center gap-1"
                      >
                        <span>{item.cost}</span>
                        <Coins size={12} />
                        <span>شراء</span>
                      </button>
                    ) : isActive ? (
                      <span className="text-[11px] bg-amber-500 text-slate-950 font-extrabold px-3 py-1 rounded-xl flex items-center gap-1">
                        <Check size={12} />
                        مفعلة حالياً
                      </span>
                    ) : (
                      <button
                        onClick={() => onEquipDeck(item.id)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                      >
                        تفعيل الظهر
                      </button>
                    )}
                  </div>

                  {/* Icon & Title info */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <h4 className="text-sm font-bold text-white">{item.nameAr}</h4>
                      <p className="text-slate-500 text-[10px]">{item.name}</p>
                    </div>
                    {/* Visual miniature of card back */}
                    <div className={`w-7 h-10 rounded shadow-md border border-white/20 flex flex-col items-center justify-center font-bold text-[10px] relative ${item.styleClass}`}>
                      <span>🃏</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sidenote about RNG */}
      <p className="text-slate-500 text-[11px] text-center mt-8 border-t border-slate-800/80 pt-4">
        مقتنيات متجر "الجوكر" تجميلية تماماً ولا تؤثر على سرعة خلط أو نزاهة توزيع الأوراق الموثقة بنسبة 100% عشوائياً.
      </p>
    </div>
  );
}
