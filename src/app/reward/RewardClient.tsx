'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useProgressStore } from "@/lib/store";
import { m as motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Gift, ChevronRight, Home, RotateCcw } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";
import { Button } from '@/components/ui/Button';

export default function RewardClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = (searchParams?.get('category') || 'learn') as 'learn' | 'alphabet' | 'speak';
  const nextUrl = searchParams?.get('nextUrl');
  const nextLabel = searchParams?.get('nextLabel');
  const replayUrl = searchParams?.get('replayUrl');

  const { language, claimGift, unopenedGifts } = useProgressStore();
  const [step, setStep] = useState<'intro' | 'opening' | 'opened'>('intro');
  const [reward, setReward] = useState<{ xp: number, coins: number } | null>(null);

  // If somehow the user navigates here without a gift, let's allow them to go back.
  // We don't auto-redirect immediately in case they want to see the error state, but 
  // here we just use the fallback in handleOpen.

  const handleOpen = () => {
    if (step !== 'intro') return;

    const giftsAvailable = unopenedGifts?.[category] || 0;
    if (giftsAvailable <= 0) {
      router.push(nextUrl || '/learn');
      return;
    }

    setStep('opening');

    // Animate shaking
    setTimeout(() => {
      const result = claimGift(category);
      if (result) {
        setReward(result);
        setStep('opened');
        triggerConfetti();
      } else {
        // Fallback if no gift available during opening
        router.push(nextUrl || '/learn');
      }
    }, 600);
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6'],
      disableForReducedMotion: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-amber-50 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      {/* Background soft glowing orbs (calmer, less psychedelic) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-200 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-pulse transition-all duration-1000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-amber-100 rounded-full mix-blend-multiply filter blur-[120px] opacity-40"></div>

      <div className="z-10 flex flex-col items-center justify-center w-full max-w-md p-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-12 text-center drop-shadow-sm">
          {step === 'opened'
            ? (language === 'en' ? 'Reward unlocked!' : 'Récompense débloquée !')
            : (language === 'en' ? 'Open your gift!' : 'Ouvrez votre cadeau !')}
        </h1>

        <AnimatePresence mode="wait">
          {step !== 'opened' ? (
            <motion.div
              key="gift"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={step === 'opening' ? {
                scale: [1, 1.1, 0.9, 1.15, 0.95, 1.1, 1],
                rotate: [0, -10, 10, -15, 15, -5, 0],
              } : { scale: 1, opacity: 1, y: 0 }}
              transition={step === 'opening' ? { duration: 0.6, ease: "easeInOut" } : { type: "spring", bounce: 0.5, duration: 0.8 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleOpen}
              className="cursor-pointer relative group"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-yellow-400 rounded-full blur-[60px] opacity-40 group-hover:opacity-60 transition-opacity"></div>

              <div className="w-48 h-48 bg-gradient-to-br from-red-500 to-rose-600 rounded-3xl shadow-[0_20px_50px_rgba(225,29,72,0.3)] border-4 border-red-400 flex items-center justify-center relative overflow-hidden">
                {/* Ribbon horizontal */}
                <div className="absolute w-full h-8 bg-yellow-400 shadow-inner"></div>
                {/* Ribbon vertical */}
                <div className="absolute h-full w-8 bg-yellow-400 shadow-inner"></div>
                <Gift size={64} className="text-yellow-100 relative z-10" />
              </div>
              <div className="mt-8 text-center text-indigo-500 font-bold animate-pulse uppercase tracking-widest text-sm">
                {language === 'en' ? 'Tap to open' : 'Touchez pour ouvrir'}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="reward"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Rewards */}
              <div className="flex flex-row items-center justify-center gap-6 w-full max-w-[320px]">
                {/* XP Reward */}
                <motion.div
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center flex-1 border-2 border-amber-100 shadow-[0_10px_30px_rgba(251,191,36,0.15)]"
                >
                  <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                    <Star size={32} className="text-amber-500 fill-current" />
                  </div>
                  <span className="text-4xl font-black text-slate-800">+{reward?.xp}</span>
                  <span className="text-amber-500 font-bold uppercase tracking-wider text-sm mt-1">XP</span>
                </motion.div>

                {/* Coins Reward (if any) */}
                {reward?.coins ? (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-3xl p-6 flex flex-col items-center justify-center flex-1 border-2 border-yellow-100 shadow-[0_10px_30px_rgba(234,179,8,0.15)]"
                  >
                    <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center shadow-inner mb-4">
                      <span className="text-3xl font-black text-yellow-500">🪙</span>
                    </div>
                    <span className="text-4xl font-black text-slate-800">+{reward.coins}</span>
                    <span className="text-yellow-500 font-bold uppercase tracking-wider text-sm mt-1">
                      {language === 'en' ? 'Coins' : 'Pièces'}
                    </span>
                  </motion.div>
                ) : null}
              </div>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex flex-col w-full gap-3 mt-8"
              >
                {nextUrl && (
                  <Button variant="gamified" size="lg" className="w-full rounded-xl uppercase tracking-widest" onClick={() => router.push(nextUrl)}>
                    <RotateCcw size={20} />
                    <span className="uppercase tracking-widest">{nextLabel || getTranslation('auto.continue', language)}</span>
                  </Button>
                )}

                <div className="flex gap-3 w-full">
                  {replayUrl && (
                    <Button variant="outline" size="lg" className="w-full rounded-xl uppercase tracking-widest" onClick={() => router.push(replayUrl)}>
                      <RotateCcw size={20} />
                      <span className="uppercase tracking-widest">{getTranslation('auto.retry', language)}</span>
                    </Button>
                  )}

                  <Button variant="outline" size="lg" className="w-full rounded-xl uppercase tracking-widest" onClick={() => router.push(`/${category === 'learn' ? 'learn' : category}`)}>
                    <RotateCcw size={20} />
                    <span className="uppercase tracking-widest">{getTranslation('auto.back', language)}</span>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
