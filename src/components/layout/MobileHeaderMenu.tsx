'use client';

import React from 'react';
import { m as motion , AnimatePresence } from "motion/react";
import { useProgressStore } from "@/lib/store";
import { useTranslation } from "@/hooks/useTranslation";
import { Star, Flame, Coins, Target, User, Heart, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from "@/components/ui/Button";
import { Typography } from "@/components/ui/Typography";

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
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm md:hidden"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 400) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-[110] bg-white/95 backdrop-blur-md rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] flex flex-col overflow-hidden md:hidden border-t border-slate-100"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-slate-200/60 rounded-full" />
            </div>

            <div className="px-6 pb-10 flex flex-col gap-8">
              {/* Top Row: Community Heart & Close */}
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    setShowCommunityModal(true);
                  }}
                  className="gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Heart size={20} className="fill-rose-500/20" />
                  Soutien & Communauté
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X size={20} strokeWidth={2.5} />
                </Button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-3xl">
                  <Star size={24} className="text-amber-400 fill-amber-400 mb-2" />
                  <Typography variant="h4" className="text-slate-800">{xp}</Typography>
                  <Typography variant="small" className="text-slate-400 mt-1 uppercase tracking-wider">XP</Typography>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-3xl">
                  <Coins size={24} className="text-yellow-400 fill-yellow-400 mb-2" />
                  <Typography variant="h4" className="text-slate-800">{goldCoins || 0}</Typography>
                  <Typography variant="small" className="text-slate-400 mt-1 uppercase tracking-wider">Pièces</Typography>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50/80 rounded-3xl">
                  <Flame size={24} className={`${currentStreak > 0 ? 'text-orange-400 fill-orange-400' : 'text-slate-300'} mb-2`} />
                  <Typography variant="h4" className={currentStreak > 0 ? 'text-slate-800' : 'text-slate-400'}>{currentStreak}</Typography>
                  <Typography variant="small" className={`mt-1 uppercase tracking-wider ${currentStreak > 0 ? 'text-slate-500' : 'text-slate-400'}`}>Série</Typography>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => {
                    onClose();
                    onOpenQuests();
                  }}
                  className="w-full justify-start gap-4 px-2"
                >
                  <div className="bg-white text-emerald-500 p-2.5 rounded-xl shadow-sm ml-1">
                    <Target size={20} strokeWidth={2.5} />
                  </div>
                  Quêtes du jour
                </Button>

                <Link href="/profile" onClick={onClose} className="w-full">
                  <Button variant="outline" size="lg" className="w-full justify-start gap-4 px-2 border-slate-100 bg-slate-50/50">
                    <div className="bg-white text-indigo-500 p-2.5 rounded-xl shadow-sm ml-1 border border-slate-100">
                      <User size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-slate-700">Mon Profil</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
