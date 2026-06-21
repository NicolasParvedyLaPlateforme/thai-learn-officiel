'use client';

import React, { useState } from 'react';
import { getLocalizedField, getTranslation } from "@/hooks/useTranslation";
import { CheckCircle, Star } from 'lucide-react';
import IconImage from '../ui/IconImage';
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

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
  const [isHovered, setIsHovered] = useState(false);
  
  const isMaxLevel = level >= 10;
  const isSuggested = suggestedLessonId === lesson.id;
  
  const hasUnlockedWords = level >= 1;
  const hasUnlockedPhrases = level >= 2;

  const showBlockedMessage = (activeTab === 'words' && !hasUnlockedWords) || (activeTab === 'phrases' && !hasUnlockedPhrases);

  const buttonText = level === 0 ? getTranslation('auto.start_learning', language) || "Commencer" : getTranslation('auto.access_levels', language) || "Accéder aux niveaux";

  const cardStyle = cn(
    "relative w-full transition-all duration-300 cursor-pointer overflow-hidden border",
    isHovered ? "shadow-md -translate-y-1" : "shadow-sm",
    isMaxLevel ? "border-emerald-100 bg-emerald-50/10" : 
    isReviewLocked ? "bg-slate-50/50 border-slate-100" : 
    isSuggested ? "border-amber-100 bg-amber-50/10" : "border-slate-100 bg-white/80"
  );

  if (isMobileLayout) {
    return (
      <Card 
        className={cn(cardStyle, "p-4 flex flex-col gap-3 rounded-3xl")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* Header & Badges */}
        <div className="flex justify-between items-start w-full">
          {/* Header: Title and Description */}
          <div className="flex flex-col items-start text-left flex-1 pr-2 overflow-hidden w-full">
            <Typography variant="h4" className="text-lg sm:text-xl truncate w-full">
              {getLocalizedField(lesson, 'title', language)}
            </Typography>
            <Typography variant="muted" className="text-xs font-medium mt-0.5 truncate w-full">
              {getLocalizedField(lesson, 'description', language)}
            </Typography>
          </div>

          {/* Badges */}
          {isMaxLevel ? (
            <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 shadow-sm px-2 py-1 gap-1 z-10 font-bold border border-emerald-200 shrink-0">
              <CheckCircle size={14} /> <span className="hidden sm:inline">{getTranslation('auto.mastered', language)}</span>
            </Badge>
          ) : isSuggested ? (
            <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 shadow-sm px-2 py-1 gap-1 z-10 font-bold border border-amber-200 shrink-0">
              <Star size={12} fill="currentColor" /> <span className="hidden sm:inline">{getTranslation('auto.suggested', language)}</span>
            </Badge>
          ) : null}
        </div>

        {/* Middle: Image Left, Words Right */}
        <div className="flex flex-row gap-4 w-full items-stretch mt-1">
          {/* Left: Image */}
          {lesson.imageUrl && (
            <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-50 flex items-center justify-center">
              <IconImage src={lesson.imageUrl} alt={lesson.title} fill className="object-cover" sizes="96px" />
              {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]"><Star size={28} className="text-white fill-white/50" /></div>}
            </div>
          )}
          
          {/* Right: Toggle + Words List */}
          <div className="flex-1 min-w-0 bg-slate-50/50 rounded-2xl p-2 flex flex-col cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex bg-slate-100/50 p-1 rounded-xl w-full mb-1">
                <button 
                  onClick={() => setActiveTab('words')}
                  className={cn("flex-1 py-1 text-[10px] font-bold rounded-lg transition-all", activeTab === 'words' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500')}
                >
                  {getTranslation('auto.words', language) || "Mots"}
                </button>
                <button 
                  onClick={() => setActiveTab('phrases')}
                  className={cn("flex-1 py-1 text-[10px] font-bold rounded-lg transition-all", activeTab === 'phrases' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500')}
                >
                  {getTranslation('auto.phrases', language) || "Phrases"}
                </button>
            </div>
            <div className="flex flex-col gap-1 overflow-y-auto min-h-[50px] max-h-[64px] px-1 custom-scrollbar">
                {showBlockedMessage ? (
                  <span className="text-[10px] leading-tight text-slate-400 italic text-center mt-2 px-1">
                    {activeTab === 'words' ? (getTranslation('auto.unlock_levels_for_words', language) || "Débloquez plus de niveaux pour voir les mots.") : (getTranslation('auto.unlock_levels_for_phrases', language) || "Débloquez plus de niveaux pour voir les phrases.")}
                  </span>
                ) : activeTab === 'words' ? (
                  lesson.words?.slice(0, 3).map((w: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-[11px] border-b border-slate-100 last:border-0 pb-0.5 last:pb-0">
                        <span className="font-semibold text-slate-700 truncate pr-1">{w.phonetic || w.th}</span>
                        <span className="text-slate-400 truncate text-right">{getLocalizedField(w, '', language)}</span>
                      </div>
                  ))
                ) : (
                  lesson.phrases?.slice(0, 2).map((p: any, i: number) => (
                      <div key={i} className="flex flex-col text-[11px] border-b border-slate-100 last:border-0 pb-0.5 last:pb-0">
                        <span className="font-semibold text-slate-700 truncate">{p.phonetic || p.th}</span>
                        <span className="text-slate-400 truncate text-[10px]">{getLocalizedField(p, '', language)}</span>
                      </div>
                  ))
                )}
            </div>
          </div>
        </div>

        {/* Bottom: Progress Bar & Button */}
        <div className="flex items-center justify-between w-full mt-2 gap-4">
          <div className="flex-1 flex flex-col gap-1.5 min-w-0">
            <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider text-slate-400">
              <span>{getTranslation('auto.mastery_6', language) || "Maîtrise"}</span>
              <span className={unit.textClass}>{level}/10</span>
            </div>
            <div className="flex justify-between gap-[2px] w-full">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className={`h-2.5 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? (unit.bgClass || unit.colorClass).replace('text-', 'bg-') : 'bg-slate-100'}`}></div>
              ))}
            </div>
          </div>
          
          <Button 
            size="sm"
            className={cn("shrink-0 shadow-none hover:shadow-sm px-4 sm:px-6", isMaxLevel || isSuggested ? unit.bgClass : 'bg-slate-800 text-white hover:bg-slate-700')}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
          >
            {level === 0 ? (getTranslation('auto.start_learning', language) || "Commencer") : (getTranslation('auto.access_levels', language) || "Accéder")}
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(cardStyle, "p-6 flex flex-col gap-4 rounded-[2rem]")}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* Header & Badges */}
      <div className="flex justify-between items-start w-full">
        <div className="flex flex-col items-start text-left flex-1 pr-4 overflow-hidden w-full">
          <Typography variant="h3" className="truncate w-full">
            {getLocalizedField(lesson, 'title', language)}
          </Typography>
          <Typography variant="muted" className="mt-1 truncate w-full">
            {getLocalizedField(lesson, 'description', language)}
          </Typography>
        </div>

        {/* Badges */}
        {isMaxLevel ? (
          <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 shadow-sm px-3 py-1 gap-1 z-10 font-bold border-[2px] border-emerald-200 shrink-0">
            <CheckCircle size={14} /> {getTranslation('auto.mastered', language)}
          </Badge>
        ) : isSuggested ? (
          <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-700 shadow-sm px-3 py-1 gap-1 z-10 font-bold border-[2px] border-amber-200 shrink-0">
            <Star size={12} fill="currentColor" /> {getTranslation('auto.suggested', language)}
          </Badge>
        ) : null}
      </div>

      <div className="w-full flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between text-xs uppercase font-bold tracking-wider text-slate-400 px-1">
          <span>{getTranslation('auto.mastery_6', language) || "Maîtrise"}</span>
          <span className={unit.textClass}>{level}/10</span>
        </div>
        <div className="flex justify-between gap-[2px] w-full">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`h-2.5 flex-1 rounded-sm first:rounded-l-full last:rounded-r-full ${i < level ? (unit.bgClass || unit.colorClass).replace('text-', 'bg-') : 'bg-slate-100'}`}></div>
          ))}
        </div>
      </div>

      <div className="w-full bg-slate-50/80 rounded-2xl p-3 mt-2 flex flex-col gap-3 cursor-default" onClick={(e) => e.stopPropagation()}>
         {/* Toggle */}
         <div className="flex bg-slate-100/80 p-1.5 rounded-xl w-full">
            <button 
              onClick={() => setActiveTab('words')}
              className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'words' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              {getTranslation('auto.words', language) || "Mots"}
            </button>
            <button 
              onClick={() => setActiveTab('phrases')}
              className={cn("flex-1 py-1.5 text-xs font-bold rounded-lg transition-all", activeTab === 'phrases' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
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
                <div key={i} className="flex justify-between items-center text-sm border-b border-slate-100 last:border-0 pb-1.5 last:pb-0">
                   <span className="font-semibold text-slate-700">{w.phonetic || w.th}</span>
                   <span className="text-slate-400 text-right">{getLocalizedField(w, '', language)}</span>
                </div>
              ))
           ) : (
              lesson.phrases?.slice(0, 3).map((p: any, i: number) => (
                <div key={i} className="flex flex-col text-sm border-b border-slate-100 last:border-0 pb-2 last:pb-0 gap-0.5">
                   <span className="font-semibold text-slate-700">{p.phonetic || p.th}</span>
                   <span className="text-slate-400 text-xs">{getLocalizedField(p, '', language)}</span>
                </div>
              ))
           )}
         </div>
      </div>

      <Button 
        size="lg"
        className={cn("w-full mt-2 shadow-none hover:shadow-sm", isMaxLevel || isSuggested ? unit.bgClass : 'bg-slate-800 text-white hover:bg-slate-700')}
        onClick={(e) => {
           e.stopPropagation();
           onClick();
        }}
      >
        {buttonText}
      </Button>

    </Card>
  );
}
