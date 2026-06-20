'use client';

import React, { useState } from 'react';
import { getLocalizedField, getTranslation } from '../../hooks/useTranslation';
import { CheckCircle, Star } from 'lucide-react';
import IconImage from '../ui/IconImage';

interface LessonCardProps {
  lesson: any;
  level: number;
  unit: any;
  language: string;
  isReviewLocked: boolean;
  suggestedLessonId: string | null;
  onClick: () => void;
  isMobileLayout?: boolean;
}

export function LessonCard({ lesson, level, unit, language, isReviewLocked, suggestedLessonId, onClick, isMobileLayout = false }: LessonCardProps) {
  const [activeTab, setActiveTab] = useState<'words' | 'phrases'>('words');
  const [isPressed, setIsPressed] = useState(false);
  
  const isMaxLevel = level >= 10;
  const isSuggested = suggestedLessonId === lesson.id;
  
  const hasUnlockedWords = level >= 1;
  const hasUnlockedPhrases = level >= 2;

  // If words are not unlocked, they are blocked.
  const showBlockedMessage = (activeTab === 'words' && !hasUnlockedWords) || (activeTab === 'phrases' && !hasUnlockedPhrases);

  const buttonText = level === 0 ? getTranslation('auto.start_learning', language) || "Commencer" : getTranslation('auto.access_levels', language) || "Accéder aux niveaux";

  if (isMobileLayout) {
    return (
      <div 
        className={`relative w-full bg-white rounded-2xl sm:rounded-[1.5rem] border-2 p-4 flex flex-col gap-3 shadow-sm transition-all group cursor-pointer
          ${isPressed ? 'translate-y-[4px] border-b-2' : 'border-b-[5px] sm:border-b-[6px]'}
          ${isMaxLevel ? 'border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : isReviewLocked ? 'bg-slate-50 border-slate-200' : isSuggested ? 'border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.3)]' : 'border-slate-200 hover:border-slate-300'}
        `}
        onPointerDown={() => setIsPressed(true)}
        onPointerUp={() => setIsPressed(false)}
        onPointerLeave={() => setIsPressed(false)}
        onPointerCancel={() => setIsPressed(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Badges */}
        {isMaxLevel ? (
          <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10">
            <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {getTranslation('auto.mastered', language)}
          </div>
        ) : isSuggested ? (
          <div className="absolute -top-3.5 right-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10">
            <Star size={12} fill="currentColor" /> {getTranslation('auto.suggested', language)}
          </div>
        ) : null}

        {/* Header: Title and Description */}
        <div className="flex flex-col items-start text-left w-full mt-1">
          <h4 className="font-extrabold text-lg sm:text-xl text-slate-800 leading-tight">
            {getLocalizedField(lesson, 'title', language)}
          </h4>
          <span className={`text-xs font-bold mt-0.5 tracking-wide text-slate-500`}>
            {getLocalizedField(lesson, 'description', language)}
          </span>
        </div>

        {/* Middle: Image Left, Words Right */}
        <div className="flex flex-row gap-3 w-full items-stretch mt-1">
          {/* Left: Image */}
          {lesson.imageUrl && (
            <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-xl overflow-hidden shrink-0 relative bg-slate-100 border border-slate-200 flex items-center justify-center">
              <IconImage src={lesson.imageUrl} alt={lesson.title} fill className="object-cover" sizes="96px" />
              {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]"><Star size={32} className="text-white fill-white/50" /></div>}
            </div>
          )}
          
          {/* Right: Toggle + Words List */}
          <div className="flex-1 min-w-0 bg-slate-50 rounded-xl p-1.5 border border-slate-100 flex flex-col cursor-default" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
            <div className="flex bg-slate-200/50 p-[3px] rounded-lg w-full mb-1">
                <button 
                  onClick={() => setActiveTab('words')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'words' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {getTranslation('auto.words', language) || "Mots"}
                </button>
                <button 
                  onClick={() => setActiveTab('phrases')}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-md transition-all ${activeTab === 'phrases' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                >
                  {getTranslation('auto.phrases', language) || "Phrases"}
                </button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto min-h-[50px] max-h-[64px] px-1 no-scrollbar">
                {showBlockedMessage ? (
                  <span className="text-[9px] leading-tight text-slate-400 italic text-center mt-2 px-1">
                    {activeTab === 'words' ? (getTranslation('auto.unlock_levels_for_words', language) || "Débloquez plus de niveaux pour voir les mots.") : (getTranslation('auto.unlock_levels_for_phrases', language) || "Débloquez plus de niveaux pour voir les phrases.")}
                  </span>
                ) : activeTab === 'words' ? (
                  lesson.words?.slice(0, 3).map((w: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[10px] border-b border-slate-200/50 last:border-0 pb-0.5 last:pb-0">
                        <span className="font-bold text-slate-700 truncate pr-1">{w.phonetic || w.th}</span>
                        <span className="text-slate-500 truncate text-right">{getLocalizedField(w, '', language)}</span>
                      </div>
                  ))
                ) : (
                  lesson.phrases?.slice(0, 2).map((p: any, i: number) => (
                      <div key={i} className="flex flex-col text-[10px] border-b border-slate-200/50 last:border-0 pb-0.5 last:pb-0">
                        <span className="font-bold text-slate-700 truncate">{p.phonetic || p.th}</span>
                        <span className="text-slate-500 truncate text-[9px]">{getLocalizedField(p, '', language)}</span>
                      </div>
                  ))
                )}
            </div>
          </div>
        </div>

        {/* Bottom: Progress Bar & Button */}
        <div className="flex items-center justify-between w-full mt-1 gap-3">
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between text-[9px] uppercase font-black tracking-wider text-slate-400">
              <span>{getTranslation('auto.mastery_6', language) || "Maîtrise"}</span>
              <span className={unit.textClass}>{level}/10</span>
            </div>
            <div className="flex justify-between gap-[2px] w-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
              ))}
            </div>
          </div>
          
          <button 
            className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white transition-all active:scale-95 shrink-0 ${unit.bgClass || unit.colorClass}`}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
          >
            {level === 0 ? (getTranslation('auto.start_learning', language) || "Commencer") : (getTranslation('auto.access_levels', language) || "Accéder")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full bg-white rounded-[1.5rem] border-2 p-5 flex flex-col gap-4 shadow-sm transition-all group cursor-pointer
        ${isPressed ? 'translate-y-[4px] border-b-2' : 'border-b-[6px]'}
        ${isMaxLevel ? 'border-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : isReviewLocked ? 'bg-slate-50 border-slate-200' : isSuggested ? 'border-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.3)]' : 'border-slate-200 hover:border-slate-300'}
      `}
      onPointerDown={() => setIsPressed(true)}
      onPointerUp={() => setIsPressed(false)}
      onPointerLeave={() => setIsPressed(false)}
      onPointerCancel={() => setIsPressed(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Badges */}
      {isMaxLevel ? (
        <div className="absolute -top-3.5 left-6 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10">
          <CheckCircle size={14} className="fill-current text-white stroke-emerald-500" /> {getTranslation('auto.mastered', language)}
        </div>
      ) : isSuggested ? (
        <div className="absolute -top-3.5 left-6 bg-amber-400 text-amber-900 text-[10px] font-black uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm z-10">
          <Star size={12} fill="currentColor" /> {getTranslation('auto.suggested', language)}
        </div>
      ) : null}

      <div className="flex flex-col items-start text-left w-full mt-2">
        <h4 className="font-extrabold text-xl text-slate-800">
          {getLocalizedField(lesson, 'title', language)}
        </h4>
        <span className={`text-sm font-bold mt-1 tracking-wide text-slate-500`}>
          {getLocalizedField(lesson, 'description', language)}
        </span>
      </div>

      <div className="w-full flex flex-col gap-1">
        <div className="flex justify-between text-[10px] uppercase font-black tracking-wider text-slate-400 px-1">
          <span>{getTranslation('auto.mastery_6', language) || "Maîtrise"}</span>
          <span className={unit.textClass}>{level}/10</span>
        </div>
        <div className="flex justify-between gap-[2px] w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-2 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? unit.colorClass : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="w-full bg-slate-50 rounded-2xl p-2 border border-slate-100 mt-2 flex flex-col gap-3 cursor-default" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
         {/* Toggle */}
         <div className="flex bg-slate-200/50 p-1 rounded-xl w-full">
            <button 
              onClick={() => setActiveTab('words')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'words' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {getTranslation('auto.words', language) || "Mots"}
            </button>
            <button 
              onClick={() => setActiveTab('phrases')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'phrases' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {getTranslation('auto.phrases', language) || "Phrases"}
            </button>
         </div>

         {/* Content */}
         <div className="flex flex-col gap-2 px-2 pb-2 min-h-[80px]">
           {showBlockedMessage ? (
              <div className="flex items-center justify-center h-full text-center text-sm font-medium text-slate-400 italic px-4 py-6">
                {activeTab === 'words' ? getTranslation('auto.unlock_levels_for_words', language) || "Débloquez plus de niveaux pour voir les mots." : getTranslation('auto.unlock_levels_for_phrases', language) || "Débloquez plus de niveaux pour voir les phrases."}
              </div>
           ) : activeTab === 'words' ? (
              lesson.words?.slice(0, 5).map((w: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-200/50 last:border-0 pb-1 last:pb-0">
                   <span className="font-bold text-slate-700">{w.phonetic || w.th}</span>
                   <span className="text-slate-500 text-right">{getLocalizedField(w, '', language)}</span>
                </div>
              ))
           ) : (
              lesson.phrases?.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="flex flex-col text-sm border-b border-slate-200/50 last:border-0 pb-2 last:pb-0 gap-0.5">
                   <span className="font-bold text-slate-700">{p.phonetic || p.th}</span>
                   <span className="text-slate-500 text-xs">{getLocalizedField(p, '', language)}</span>
                </div>
              ))
           )}
         </div>
      </div>

      <button 
        className={`w-full py-3 mt-2 rounded-xl font-extrabold text-white transition-all active:scale-95 cursor-pointer ${unit.bgClass || unit.colorClass}`}
        onClick={(e) => {
           e.stopPropagation();
           onClick();
        }}
      >
        {buttonText}
      </button>

    </div>
  );
}
