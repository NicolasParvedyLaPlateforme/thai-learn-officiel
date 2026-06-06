'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProgressStore } from '../lib/store';
import { useTranslation } from '../hooks/useTranslation';
import { Star, Flame, Coins, Target, User, Heart, X } from 'lucide-react';
import Link from 'next/link';

interface MobileHeaderMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuests: () => void;
}

export function MobileHeaderMenu({ isOpen, onClose, onOpenQuests }: MobileHeaderMenuProps) {
  const { xp, goldCoins, currentStreak, language, setShowCommunityModal } = useProgressStore();
  const { t } = useTranslation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm md:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden md:hidden"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-3 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="px-6 pb-8 flex flex-col gap-6">
              {/* Top Row: Community Heart & Close */}
              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    onClose();
                    setShowCommunityModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-500 rounded-2xl font-extrabold hover:bg-rose-100 transition-colors"
                >
                  <Heart size={20} className="fill-rose-500" />
                  <span>Soutien & Communauté</span>
                </button>

                <button
                  onClick={onClose}
                  className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-slate-200 hover:text-slate-600 transition-colors"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center p-3 bg-amber-50 rounded-2xl border-2 border-amber-100">
                  <Star size={24} className="text-amber-500 fill-amber-500 mb-1" />
                  <span className="font-extrabold text-slate-800 text-lg">{xp}</span>
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">XP</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-yellow-50 rounded-2xl border-2 border-yellow-100">
                  <Coins size={24} className="text-yellow-500 fill-yellow-500 mb-1" />
                  <span className="font-extrabold text-slate-800 text-lg">{goldCoins || 0}</span>
                  <span className="text-[10px] font-bold text-yellow-600 uppercase tracking-wider">Pièces</span>
                </div>
                <div className="flex flex-col items-center justify-center p-3 bg-orange-50 rounded-2xl border-2 border-orange-100">
                  <Flame size={24} className={`${currentStreak > 0 ? 'text-orange-500 fill-orange-500' : 'text-slate-300'} mb-1`} />
                  <span className={`font-extrabold text-lg ${currentStreak > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{currentStreak}</span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStreak > 0 ? 'text-orange-600' : 'text-slate-400'}`}>Série</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onClose();
                    onOpenQuests();
                  }}
                  className="flex items-center gap-4 w-full p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-100"
                >
                  <div className="bg-emerald-500 text-white p-2 rounded-xl">
                    <Target size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold text-lg">Quêtes du jour</span>
                </button>

                <Link
                  href="/profile"
                  onClick={onClose}
                  className="flex items-center gap-4 w-full p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-100 transition-colors border border-indigo-100"
                >
                  <div className="bg-indigo-500 text-white p-2 rounded-xl">
                    <User size={20} strokeWidth={2.5} />
                  </div>
                  <span className="font-extrabold text-lg">Mon Profil</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
