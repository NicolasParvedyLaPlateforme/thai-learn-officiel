'use client';

import { useEffect, useState } from 'react';
import { useProgressStore } from '../../lib/store';
import { m as motion , AnimatePresence } from "motion/react";
import { Coins, Sparkles, Trophy } from 'lucide-react';
import { getTranslation } from '../../hooks/useTranslation';

export function GoldConversionModal() {
  const { pendingGoldConversion, clearPendingGoldConversion, language } = useProgressStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (pendingGoldConversion) {
      // Trigger confetti when modal appears
      setTimeout(async () => {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#FCD34D', '#FFFBEB'] // Gold colors
        });
      }, 500);
    }
  }, [pendingGoldConversion]);

  if (!mounted || !pendingGoldConversion) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
        >
          {/* Decorative background */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-400 to-yellow-500 opacity-20"></div>
          
          <div className="relative flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mb-6 shadow-inner relative">
              <Coins size={40} className="relative z-10" />
              <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={24} />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">
              {getTranslation('leaderboard.month_ended', language)}
            </h2>
            
            <p className="text-slate-500 mb-8 leading-relaxed">
              {getTranslation('leaderboard.month_converted', language)}
            </p>

            <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 border-2 border-slate-100 flex items-center justify-between">
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-slate-400 mb-1 uppercase tracking-wider">{getTranslation('leaderboard.old_xp', language)}</span>
                <span className="text-2xl font-extrabold text-slate-700 line-through opacity-70">{pendingGoldConversion.oldXp}</span>
              </div>
              
              <div className="flex flex-col items-center text-amber-500 animate-bounce">
                <span className="text-2xl font-bold">→</span>
              </div>

              <div className="flex flex-col items-center">
                <span className="text-sm font-bold text-amber-500 mb-1 uppercase tracking-wider">{getTranslation('leaderboard.gold_coins', language)}</span>
                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-xl font-extrabold text-2xl border-2 border-amber-200 shadow-sm">
                  <Coins size={24} />
                  <span>+{pendingGoldConversion.newCoins}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => clearPendingGoldConversion()}
              className="w-full bg-amber-500 text-white font-bold text-lg py-4 rounded-xl border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg hover:bg-amber-400"
            >
              {getTranslation('leaderboard.collect_coins', language)}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
