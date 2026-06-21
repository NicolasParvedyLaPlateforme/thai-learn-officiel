import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import React from 'react';
import Link from 'next/link';
import { useProgressStore } from "@/lib/store";
import { useNextConversationObjective } from "@/hooks/useNextConversationObjective";
import { Target, MessageCircle, Map, Play, BookOpen, ChevronRight } from 'lucide-react';

export function ConversationObjectiveWidget() {
  const { language } = useProgressStore();
  const objective = useNextConversationObjective();

  if (!objective) return null;

  return (
    <div className="w-full border-b border-slate-100 py-6 px-1 flex flex-col gap-4 relative group">
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100/50 text-blue-500 rounded-xl flex items-center justify-center shadow-sm">
            <Map size={22} className="stroke-[2.5]" />
          </div>
          <h2 className="font-extrabold text-slate-800 text-[17px] tracking-tight">
            {getTranslation('auto.story_objective', language)}
          </h2>
        </div>
      </div>

      <div className="w-full flex flex-col bg-blue-50/40 rounded-[16px] md:rounded-[20px] p-4 md:p-5 border border-blue-100/50 relative z-10 overflow-hidden">
        {/* Fond avec un motif très léger (points) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
        
        {/* Cercles de décoration en arrière-plan du bloc */}
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-200/40 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-purple-200/40 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex flex-col gap-1.5 pr-2 w-full">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${objective.type === 'vocab' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {objective.type === 'vocab'
                  ? (getTranslation('auto.missing_vocabulary', language))
                  : (getTranslation('auto.continue_the_story', language))}
              </span>
            </div>

            <span className="text-[15px] font-extrabold text-slate-800 leading-tight mt-1">
              {getLocalizedField(objective.conversation, 'title', language)}
            </span>

            <span className="text-[13px] text-slate-500 font-medium">
              {objective.type === 'vocab' ? (
                <>
                  {getTranslation('auto.complete_level_1_of', language)}{' '}
                  <strong className="text-indigo-600 bg-indigo-50 px-1 rounded">{getLocalizedField(objective.lesson, 'title', language)}</strong>
                </>
              ) : (
                <>
                  {language === 'en'
                    ? `Complete ${objective.levelToComplete === 0 ? 'Base conversation' : `Level ${objective.levelToComplete}`}`
                    : language === 'es'
                    ? `Completa ${objective.levelToComplete === 0 ? 'Conversación base' : `Nivel ${objective.levelToComplete}`}`
                    : `Terminer ${objective.levelToComplete === 0 ? 'Conversation de base' : `Niveau ${objective.levelToComplete}`}`}
                </>
              )}
            </span>
          </div>
        </div>

        <Link
          href={
            objective.type === 'vocab'
              ? `/lesson/${objective.lesson.id}?level=1`
              : `/conversations/${objective.conversation.id}${objective.levelToComplete > 0 ? `?level=${objective.levelToComplete}` : ''}`
          }
          className={`mt-4 md:mt-5 w-full flex items-center justify-center gap-2 py-2.5 md:py-3 rounded-xl font-bold text-[14px] md:text-[15px] text-white shadow-md transition-all active:scale-[0.98] relative overflow-hidden group/btn
             ${objective.type === 'vocab' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-200' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200'}
          `}
        >
          {/* Effet de brillance au hover */}
          <div className="absolute inset-0 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

          {objective.type === 'vocab' ? <BookOpen size={18} /> : <Play size={18} className="fill-current" />}
          <span className="relative z-10">{getTranslation('auto.go_to_objective', language)}</span>
        </Link>
      </div>
    </div>
  );
}
