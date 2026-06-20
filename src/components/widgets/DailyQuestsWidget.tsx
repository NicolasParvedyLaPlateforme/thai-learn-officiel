"use client";

import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React, { useEffect, useState } from 'react';
import { useProgressStore, DailyQuest } from "@/lib/store";
import { Target, CheckCircle2, Star } from 'lucide-react';

export function DailyQuestsWidget({ category = 'learn' }: { category?: 'learn' | 'alphabet' | 'speak' }) {
  const { dailyQuests, language, questsDate, unopenedGifts } = useProgressStore();
  const [mounted, setMounted] = useState(false);
  const [animateBars, setAnimateBars] = useState(false);

  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => setAnimateBars(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!mounted) return null;

  const getTitle = (quest: DailyQuest) => {
    return getLocalizedField(quest, 'title', language);
  };

  const questsForCategory = dailyQuests?.[category] || [];
  const completedCount = questsForCategory.filter(q => q.completed).length;
  const giftsAvailable = unopenedGifts?.[category] || 0;

  return (
    <div className="w-full bg-white rounded-2xl md:rounded-[24px] border border-slate-100 md:border-2 p-4 md:p-5 shadow-sm flex flex-col gap-3 md:gap-4 relative">
      {/* Fond décoratif très subtil */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-emerald-50 rounded-full opacity-50 pointer-events-none"></div>

      <div className="flex items-center justify-between mb-1 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100/50 flex items-center justify-center text-emerald-500 shadow-sm">
            <Target size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] tracking-tight">
            {getTranslation('auto.daily_quests', language)}
          </h2>
        </div>

        {/* Jauge globale en forme de badge stylisé ou bouton Cadeau */}
        {giftsAvailable > 0 ? (
          <button
            onClick={() => window.location.href = `/reward?category=${category}&nextUrl=${encodeURIComponent(window.location.pathname)}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm shadow-md bg-rose-500 text-white shadow-rose-200 hover:scale-105 active:scale-95 transition-all animate-pulse cursor-pointer"
          >
            <span className="flex items-center justify-center text-lg">🎁</span>
            <span>{giftsAvailable}</span>
          </button>
        ) : (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm transition-colors ${completedCount === questsForCategory.length && questsForCategory.length > 0 ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
            <span className="flex items-center justify-center">
              {completedCount === questsForCategory.length && questsForCategory.length > 0 ? '🏆' : '🎁'}
            </span>
            <span>{completedCount} / {questsForCategory.length}</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 relative z-10 mt-1">
        {questsForCategory.length === 0 ? (
          <div className="text-sm font-medium text-slate-500 italic text-center py-4 bg-slate-50 rounded-xl border border-slate-100">
            {getTranslation('auto.no_quests_for_today', language)}
          </div>
        ) : (
          questsForCategory.map((quest, i) => {
            const progressPercent = Math.min(100, Math.max(0, (quest.progress / quest.target) * 100));
            // Couleurs alternées pour un côté plus fun (vert, bleu, violet)
            const colors = [
              { border: 'bg-emerald-400', bar: 'from-emerald-400 to-emerald-300', text: 'text-emerald-500', light: 'bg-emerald-50' },
              { border: 'bg-blue-400', bar: 'from-blue-400 to-blue-300', text: 'text-blue-500', light: 'bg-blue-50' },
              { border: 'bg-purple-400', bar: 'from-purple-400 to-purple-300', text: 'text-purple-500', light: 'bg-purple-50' }
            ];
            const theme = colors[i % colors.length];

            return (
              <div key={quest.id} className="group relative w-full flex flex-col bg-white rounded-[16px] md:rounded-2xl p-3 md:p-4 border md:border-2 border-slate-100 shadow-sm md:shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:border-slate-200 transition-all overflow-hidden">
                {/* Bordure colorée à gauche */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${quest.completed ? 'bg-emerald-500' : theme.border}`} />

                <div className="flex items-start justify-between mb-3 pl-2">
                  <span className={`text-[14.5px] font-bold leading-tight ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {getTitle(quest)}
                  </span>
                  {quest.completed ? (
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-500 shrink-0 ml-3">
                      <CheckCircle2 size={16} className="stroke-[3]" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg text-[11px] font-black text-amber-600 shrink-0 ml-3 shadow-sm">
                      <Star size={12} className="fill-current" /> +{quest.rewardXp} XP
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 w-full pl-2">
                  <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                    <div
                      className={`h-full rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative ${quest.completed ? 'bg-emerald-500' : `bg-gradient-to-r ${theme.bar}`}`}
                      style={{ width: `${animateBars ? progressPercent : 0}%` }}
                    >
                      {/* Brillance sur la barre */}
                      {!quest.completed && progressPercent > 5 && (
                        <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                      )}
                    </div>
                  </div>
                  <span className={`text-[12px] font-black w-10 text-right shrink-0 ${quest.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {quest.progress}/{quest.target}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
