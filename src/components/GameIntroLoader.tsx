/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GameIntroLoaderProps {
  onComplete: () => void;
}

export default function GameIntroLoader({ onComplete }: GameIntroLoaderProps) {
  const [stage, setStage] = useState<'black_logo' | 'red_felt_loading'>('black_logo');
  const [progress, setProgress] = useState(0);

  // Stage 1 timer: 1 second on Black Screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('red_felt_loading');
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Stage 2: Loading progress over 1.2 seconds
  useEffect(() => {
    if (stage !== 'red_felt_loading') return;

    const duration = 1200; // 1.2 seconds to load
    const intervalTime = 40;
    const step = 100 / (duration / intervalTime);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 300);
          return 100;
        }
        return Math.min(prev + step, 100);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, [stage, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black select-none overflow-hidden flex items-center justify-center font-sans">
      <AnimatePresence mode="wait">
        
        {/* STAGE 1: BLACK LOGO INTRO SCREEN (الصورة الأولى السوداء بالبداية لمدة ٣ ثواني) */}
        {stage === 'black_logo' && (
          <motion.div
            key="stage1_black"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-black flex flex-col items-center justify-center text-white"
          >
            {/* Ambient subtle glow behind text */}
            <div className="absolute w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Central Calligraph/Text & Jester Hat Logo Graphic */}
            <div className="relative flex flex-col items-center select-none scale-110 sm:scale-125">
              
              {/* Jester Hat above the text */}
              <div className="mb-[-15px] z-10 flex justify-center items-end h-16 w-36 relative">
                {/* Middle Yellow Bell Peak */}
                <div className="w-8 h-12 bg-amber-500 rounded-t-full rounded-b-lg transform origin-bottom scale-x-110 relative flex justify-center">
                  <div className="w-1.5 h-1.5 bg-yellow-300 rounded-full absolute -top-1 animate-pulse" />
                </div>
                
                {/* Left Curved Green/Emerald Bell Peak */}
                <div className="w-7 h-10 bg-emerald-600 rounded-t-full rounded-br-lg transform origin-bottom-right rotate-[-28deg] translate-x-2 relative flex justify-center">
                  <div className="w-1.5 h-1.5 bg-green-300 rounded-full absolute -top-1" />
                </div>

                {/* Right Curved Red Bell Peak */}
                <div className="w-7 h-10 bg-rose-600 rounded-t-full rounded-bl-lg transform origin-bottom-left rotate-[28deg] -translate-x-2 relative flex justify-center">
                  <div className="w-1.5 h-1.5 bg-red-300 rounded-full absolute -top-1" />
                </div>

                {/* Side Leaf Accents matching screen representation */}
                <div className="absolute bottom-1 -left-4 w-3 h-3 bg-emerald-600 rounded-full rotate-45" />
                <div className="absolute bottom-1 -right-4 w-3 h-3 bg-emerald-600 rounded-full -rotate-45" />
              </div>

              {/* Bold Arabic custom "الجوكر" text representation */}
              <h1 className="text-6xl font-black tracking-tight font-sans text-center relative select-none">
                الجوكر
              </h1>
            </div>

            {/* Bottom-right elegant sparkle diamond */}
            <div className="absolute bottom-6 right-6 text-slate-700 font-bold text-2xl opacity-60">
              ✦
            </div>
          </motion.div>
        )}

        {/* STAGE 2: LUXURIOUS RED FELT CARD BOARD SCREEN WITH CENTRAL MASCOT + SCATTERED CARDS & AMBIENT ANIMATION */}
        {stage === 'red_felt_loading' && (
          <motion.div
            key="stage2_loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[#4a0404] flex flex-col items-center justify-between text-white p-6 relative"
          >
            {/* Elegant Red Felt Ambient Texture & Vintage Radial Shadow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#7f1d1d_10%,_#450a0a_100%)] opacity-95 pointer-events-none z-0" />
            <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none z-0" />

            {/* Scattered Card / Game Elements representation in Background - EXACTLY AS THE SCREENSHOT */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
              {/* Green marble coin / bubble */}
              <div className="absolute top-[35%] left-[8%] w-4 h-4 bg-lime-500 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />
              
              {/* Yellow marble coin */}
              <div className="absolute top-[42%] right-[10%] w-4 h-4 bg-yellow-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />

              {/* Red marble coin */}
              <div className="absolute bottom-[28%] left-[40%] w-4.5 h-4.5 bg-rose-500 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />

              {/* Blue marble coin */}
              <div className="absolute bottom-[20%] left-[5%] w-4 h-4 bg-cyan-400 rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.5)]" />

              {/* Fanned Card Ace of Spades */}
              <div className="absolute top-[33%] left-[18%] w-24 h-36 bg-gradient-to-b from-white to-slate-200 text-slate-950 rounded-xl p-2.5 flex flex-col justify-between font-bold border border-white/20 shadow-2xl -rotate-[22deg]">
                <div className="flex flex-col items-start leading-none text-xs">
                  <span>A</span>
                  <span className="text-[10px]">♠</span>
                </div>
                <div className="text-center text-4xl filter drop-shadow">♠</div>
                <div className="flex flex-col items-end leading-none text-xs">
                  <span className="text-[10px]">♠</span>
                  <span>A</span>
                </div>
              </div>

              {/* Draw +4 Card with wild coloring matching screenshot exactly */}
              <div className="absolute top-[38%] right-[12%] w-24 h-36 bg-zinc-900 border-2 border-zinc-700 text-white rounded-xl p-2.5 flex flex-col justify-between font-bold shadow-2xl rotate-[14deg]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-sans font-black">+4</span>
                  <span className="text-[9px]">🍀</span>
                </div>
                <div className="my-auto flex flex-col items-center justify-center">
                  <div className="grid grid-cols-2 gap-1 w-10 h-10 rotate-45 overflow-hidden rounded-full">
                    <div className="bg-red-500" />
                    <div className="bg-blue-500" />
                    <div className="bg-yellow-500" />
                    <div className="bg-emerald-500" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[9px]">🍀</span>
                  <span className="font-sans font-black">+4</span>
                </div>
              </div>

              {/* Classic Domino tile blocks scattered on the felt board */}
              <div className="absolute top-[45%] left-[55%] w-12 h-20 bg-amber-50 rounded-lg p-1.5 flex flex-col justify-between items-center shadow-lg rotate-[35deg] border border-black/40">
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
                <div className="w-full h-[1.5px] bg-slate-400" />
                <div className="grid grid-cols-2 gap-1.5">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
              </div>

              {/* Second Domino tile */}
              <div className="absolute bottom-[50%] left-[28%] w-12 h-20 bg-amber-50 rounded-lg p-1.5 flex flex-col justify-between items-center shadow-lg -rotate-[48deg] border border-black/40">
                <div className="grid grid-cols-1 gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
                <div className="w-full h-[1.5px] bg-slate-400" />
                <div className="grid grid-cols-3 gap-1">
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                </div>
              </div>

              {/* Ludo boards or wooden dice fields at bottom-left */}
              <div className="absolute bottom-[3%] -left-12 w-48 h-48 bg-[#92400e]/75 rounded-2xl p-4 border-4 border-amber-950 shadow-xl rotate-[12deg]">
                <div className="grid grid-cols-3 gap-2">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-[#15803d]/45 border border-emerald-950 mx-auto" />
                  ))}
                </div>
              </div>

              {/* King card at bottom-right corner representing the gorgeous stack overlay */}
              <div className="absolute bottom-2 right-2 w-20 h-28 bg-white text-zinc-950 border border-slate-300 rounded-lg p-2 flex flex-col justify-between font-bold scale-90 rotate-[-15deg] shadow-lg">
                <div className="flex justify-between items-center text-[10px]">
                  <span>K</span>
                  <span className="text-red-600">♠</span>
                </div>
                <div className="text-center text-xl text-red-600">♠</div>
                <div className="text-right text-[8px] text-slate-400">الملك</div>
              </div>

              {/* Joker card floating under the layout */}
              <div className="absolute bottom-[22%] right-[5%] w-22 h-32 bg-white text-slate-900 rounded-xl p-2 flex flex-col justify-between font-sans rotate-[-25deg] shadow-2xl">
                <div className="flex justify-between items-center text-[9px] font-black text-amber-500">
                  <span>JOKER</span>
                  <span>🃏</span>
                </div>
                <div className="text-center text-3xl">🃏</div>
                <span className="text-[7px] text-slate-400 text-right font-sans">بطاقة الجوكر</span>
              </div>
            </div>

            {/* HEADER / LOGO REGION WITH IMMERSIVE ENHANCEMENT */}
            <div className="mt-12 z-10 text-center flex flex-col items-center">
              
              {/* Premium Mascot Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, type: 'spring' }}
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-red-600 p-1 shadow-[0_0_55px_rgba(244,63,94,0.45)] mb-3 flex items-center justify-center relative overflow-hidden"
              >
                <img 
                  src="/joker_logo.jpg" 
                  className="w-full h-full rounded-full object-cover border-4 border-[#1e1c22]/90 shadow-[inset_0_4px_10px_rgba(255,255,255,0.35)]" 
                  alt="شعار كوتشينة الجوكر"
                  referrerPolicy="no-referrer"
                />
              </motion.div>

              {/* Accent metallic arabic title label */}
              <motion.h2 
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-400 to-amber-100 filter drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]"
              >
                لعبة الجوكر
              </motion.h2>
            </div>

            {/* PROGRESS LOADING ELEMENT AREA AT BOT-CENTER (تقوم بتحميل في مكان التحميل اسفل الصورة وبعدها تفتح الواجهة الثالثة) */}
            <div className="w-full max-w-xs mx-auto text-center mb-10 z-10">
              
              {/* Loading caption */}
              <p className="text-white/90 text-sm font-bold tracking-widest mb-2 font-mono animate-pulse">
                Loading... {Math.round(progress)}%
              </p>

              {/* Immersive gold status description changing as it loads */}
              <p className="text-amber-400 text-[10.5px] font-bold mb-3 min-h-[16px]">
                {progress < 25 && 'جاري جرد أوراق اللعب وخلطها...'}
                {progress >= 25 && progress < 55 && 'جاري مصافحة خادم الجوكر السحابي الآمن...'}
                {progress >= 55 && progress < 85 && 'تهيئة بورد طاولات الترنيب 41...'}
                {progress >= 85 && 'جاهز للانطلاق! أتمنى لك حظاً موفقاً 🃏'}
              </p>

              {/* Progress Bar Container */}
              <div className="w-full h-2.5 bg-black/60 rounded-full overflow-hidden border border-white/10 shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-yellow-500 via-amber-400 to-yellow-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                  style={{ width: `${progress}%` }}
                  transition={{ ease: "easeOut" }}
                />
              </div>

            </div>

            {/* Subtlest brand stamp at lower corner */}
            <div className="absolute bottom-3 right-4 text-[9px] text-white/35 font-mono select-none">
              Joker Premium Engine
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
