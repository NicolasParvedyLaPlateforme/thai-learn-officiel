"use client";

import { getTranslation, getLocalizedField } from '../hooks/useTranslation';
import React, { useEffect, useState } from 'react';
import { useProgressStore, DailyQuest } from '../lib/store';
import { Target, CheckCircle2, Star } from 'lucide-react';

export function DailyQuestsWidget({ category = 'learn' }: { category?: 'learn' | 'alphabet' }) {
  const { dailyQuests, language, questsDate } = useProgressStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getTitle = (quest: DailyQuest) => {
    return getLocalizedField(quest, 'title', language);
  };

  const questsForCategory = dailyQuests?.[category] || [];
  const completedCount = questsForCategory.filter(q => q.completed).length;

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Target size={20} className="text-emerald-500" />
          <h2 className="font-extrabold text-slate-800 text-base">
            {getTranslation('auto.daily_quests', language)}
          </h2>
        </div>
        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
          {completedCount} / {questsForCategory.length} {getTranslation('auto.quests', language)}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {questsForCategory.length === 0 ? (
          <div className="text-sm font-medium text-slate-500 italic text-center py-4">
             {getTranslation('auto.no_quests_for_today', language)}
          </div>
        ) : (
          questsForCategory.map(quest => {
            const progressPercent = Math.min(100, Math.max(0, (quest.progress / quest.target) * 100));
            return (
              <div key={quest.id} className="w-full flex flex-col bg-slate-50 rounded-xl p-3 border border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <span className={`text-sm font-bold ${quest.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {getTitle(quest)}
                  </span>
                  {quest.completed ? (
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0 ml-2" />
                  ) : (
                    <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-black text-amber-600 shrink-0 ml-2">
                      <Star size={10} className="fill-current" /> +{quest.rewardXp} XP
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 w-full">
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${quest.completed ? 'bg-emerald-500' : 'bg-emerald-400'}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 w-8 text-right shrink-0">
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
