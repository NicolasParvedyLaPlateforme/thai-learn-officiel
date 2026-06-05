import { getTranslation } from '../hooks/useTranslation';
import React from 'react';
import Link from 'next/link';
import { useProgressStore } from '../lib/store';
import { useNextConversationObjective } from '../lib/useNextConversationObjective';
import { Target, MessageCircle, Map, Play, BookOpen, ChevronRight } from 'lucide-react';

export function ConversationObjectiveWidget() {
  const { language } = useProgressStore();
  const objective = useNextConversationObjective();

  if (!objective) return null;

  return (
    <div className="w-full bg-white rounded-2xl border-2 border-slate-100 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg">
            <Map size={18} />
          </div>
          <h2 className="font-extrabold text-slate-800 text-sm">
            {getTranslation('auto.story_objective', language)}
          </h2>
        </div>
      </div>

      <div className="w-full flex flex-col bg-slate-50 rounded-xl p-3 border border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1 pr-2">
            <span className="text-xs font-semibold text-slate-400">
              {objective.type === 'vocab' 
                ? (getTranslation('auto.missing_vocabulary', language))
                : (getTranslation('auto.continue_the_story', language))}
            </span>
            <span className="text-sm font-bold text-slate-700">
               {language === 'en' ? (objective.conversationTitleEn || objective.conversationTitle) : objective.conversationTitle}
            </span>
            
            <span className="text-xs text-slate-500 mt-1">
              {objective.type === 'vocab' ? (
                <>
                  {getTranslation('auto.complete_level_1_of', language)}
                  <strong className="text-blue-600">{language === 'en' ? objective.lessonTitleEn : objective.lessonTitle}</strong>
                </>
              ) : (
                <>
                  {language === 'en' 
                    ? `Complete ${objective.levelToComplete === 0 ? 'Base conversation' : `Level ${objective.levelToComplete}`}` 
                    : `Terminer ${objective.levelToComplete === 0 ? 'Conversation de base' : `Niveau ${objective.levelToComplete}`}`}
                </>
              )}
            </span>
          </div>
        </div>

        <Link 
          href={
            objective.type === 'vocab' 
              ? `/lesson/${objective.lessonId}?level=1` 
              : `/conversations/${objective.conversationId}${objective.levelToComplete > 0 ? `?level=${objective.levelToComplete}` : ''}`
          }
          className={`mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-sm text-white transition-colors
             ${objective.type === 'vocab' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-emerald-500 hover:bg-emerald-600'}
          `}
        >
          {objective.type === 'vocab' ? <BookOpen size={16} /> : <Play size={16} className="fill-current" />}
          {getTranslation('auto.go_to_objective', language)}
        </Link>
      </div>
    </div>
  );
}
