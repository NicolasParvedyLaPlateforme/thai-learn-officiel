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
    <div className="w-full border-b border-slate-100 py-6 px-1 flex flex-col gap-4 relative">
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
          <div className="flex flex-col">
            {questsForCategory.map((quest, i) => {
              const progressPercent = Math.min(100, Math.max(0, (quest.progress / quest.target) * 100));
              const colors = [
                { bar: 'from-emerald-400 to-emerald-300', iconBg: 'bg-emerald-100 text-emerald-500' },
                { bar: 'from-blue-400 to-blue-300', iconBg: 'bg-blue-100 text-blue-500' },
                { bar: 'from-purple-400 to-purple-300', iconBg: 'bg-purple-100 text-purple-500' }
              ];
              const theme = colors[i % colors.length];

              return (
                <div key={quest.id} className="group relative w-full flex items-center py-3 border-b border-slate-100/60 last:border-0 hover:bg-slate-50/50 transition-colors rounded-lg px-2 -mx-2">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mr-3 shadow-sm ${quest.completed ? 'bg-emerald-100 text-emerald-500' : theme.iconBg}`}>
                    {quest.completed ? <CheckCircle2 size={18} className="stroke-[3]" /> : <Target size={18} className="stroke-[2.5]" />}
                  </div>
                  
                  <div className="flex flex-col flex-1 min-w-0 pr-3">
                    <span className={`text-[13.5px] font-bold leading-tight truncate mb-1.5 ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {getTitle(quest)}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
                        <div
                          className={`h-full rounded-full transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] relative ${quest.completed ? 'bg-emerald-500' : `bg-gradient-to-r ${theme.bar}`}`}
                          style={{ width: `${animateBars ? progressPercent : 0}%` }}
                        >
                          {!quest.completed && progressPercent > 5 && (
                            <div className="absolute top-0 bottom-0 left-0 right-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full animate-[shimmer_2s_infinite]"></div>
                          )}
                        </div>
                      </div>
                      <span className={`text-[11px] font-black shrink-0 ${quest.completed ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {quest.progress}/{quest.target}
                      </span>
                    </div>
                  </div>
                  
                  {!quest.completed && (
                    <div className="flex items-center gap-1 text-[11px] font-black text-amber-500 shrink-0">
                      <Star size={12} className="fill-current" /> {quest.rewardXp}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
