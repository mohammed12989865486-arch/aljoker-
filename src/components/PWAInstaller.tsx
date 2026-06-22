/**
 * Progressive Web App Installer Component
 * Facilitates custom app installation prompts in absolute sleek RTL Arabized style.
 * Supports:
 * - Native Chromium installation prompts (Android, Chrome Mobile/Desktop, Edge)
 * - iOS Safari manual installation guides ("Add to Home Screen" instructions)
 * - Remembers user's "Dismiss" preference using sessionStorage to avoid interface clutter
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Share, PlusSquare, X, Smartphone, ArrowDown, HelpCircle, Sparkles } from 'lucide-react';

export default function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstaller, setShowInstaller] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'guide'>('prompt');

  useEffect(() => {
    // 1. Detect if the app is already running as installed (standalone)
    const isRunningStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isRunningStandalone);

    // 2. Identify if device is running iOS
    const checkIsIOS = () => {
      const uAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(uAgent);
    };
    setIsIOS(checkIsIOS());

    // 3. Listen for Chromium browser installer registration
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Only display the custom prompt if not dismissed this session and not already standalone
      const isDismissed = sessionStorage.getItem('joker_pwa_dismissed') === 'true';
      if (!isDismissed && !isRunningStandalone) {
        setShowInstaller(true);
        setActiveTab('prompt');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // If iOS and not running standalone, show the custom installation guide after a slight delay
    const isDismissed = sessionStorage.getItem('joker_pwa_dismissed') === 'true';
    if (checkIsIOS() && !isRunningStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setShowInstaller(true);
        setActiveTab('guide');
      }, 4000); // Wait 4 seconds to not interrupt loading splash
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Trigger native browser install prompt
    deferredPrompt.prompt();

    // Check user decision
    const { outcome } = await deferredPrompt.userChoice;
    console.log('[PWA] User installation choice response:', outcome);

    // Reset prompt and hide custom overlay
    setDeferredPrompt(null);
    setShowInstaller(false);
  };

  const handleDismiss = () => {
    setShowInstaller(false);
    sessionStorage.setItem('joker_pwa_dismissed', 'true');
  };

  // If already installed or shouldn't show, render nothing
  if (isStandalone || !showInstaller) {
    return null;
  }

  return (
    <AnimatePresence>
      <div id="pwa-install-container" className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-slate-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl p-5 shadow-2xl text-white relative overflow-hidden"
          dir="rtl"
        >
          {/* Subtle glowing amber ambient indicator */}
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-amber-500 via-yellow-500 to-transparent" />

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 left-3 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
            title="إغلاق التنبيه"
          >
            <X size={16} />
          </button>

          {activeTab === 'prompt' && deferredPrompt ? (
            /* Standard Native Prompt interface */
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 flex-shrink-0 shadow-lg shadow-amber-500/20 active:scale-95">
                  <span className="text-2xl">🤡</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-amber-400 font-sans">تثبيت تطبيق الجوكر</h3>
                    <Sparkles size={14} className="text-yellow-400 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    احصل على أفضل تجربة للعبة الكوتشينة مع وصول أسرع، استهلاك أقل للبيانات، وأداء فائق السرعة عبر شاشتك الرئيسية!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-xs font-bold text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                >
                  ليس الآن
                </button>
                <button
                  onClick={handleInstallClick}
                  className="px-4 py-2 text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 rounded-xl hover:from-amber-300 hover:to-yellow-400 transition-all shadow-md shadow-amber-500/10 flex items-center justify-center gap-2"
                >
                  <Download size={14} />
                  تثبيت على الهاتف
                </button>
              </div>
            </div>
          ) : (
            /* iOS Custom Safari Guide interface */
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-indigo-500/20">
                  <Smartphone size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-400">تثبيت التطبيق على آيفون</h3>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    خطوات بسيطة لتثبيت تطبيق "الجوكر" مباشرة عبر متصفح سفاري دون الحاجة لمتجر التطبيقات:
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/50 rounded-xl p-3 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-500">
                    ١
                  </div>
                  <span>
                    اضغط على أيقونة المشاركة في شريط سفاري السفلي <Share size={12} className="inline text-blue-400 mx-0.5" />.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-500">
                    ٢
                  </div>
                  <span>
                    اسحب القائمة لأسفل واختر <strong className="text-white">"إضافة إلى الشاشة الرئيسية"</strong> <PlusSquare size={12} className="inline text-emerald-400 mx-0.5" />.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-amber-500">
                    ٣
                  </div>
                  <span>
                    اضغط على <strong className="text-amber-400">"إضافة"</strong> في الزاوية العلوية لتأكيد التحميل.
                  </span>
                </div>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full py-2 bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition-all border border-slate-700/50 hover:bg-slate-700"
              >
                حسنًا، فهمت
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
