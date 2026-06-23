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
import { formatCombiningChar } from "@/lib/alphabet-utils";

interface SharedLessonCardProps {
  pathType: 'learn' | 'alphabet' | 'speak';
  lesson: any;
  level: number;
  unit: any;
  language: string;
  isReviewLocked: boolean;
  suggestedLessonId: string | null;
  onClick: () => void;
  maxLevelPerLesson?: number;
  isMobileLayout?: boolean;
}

export function SharedLessonCard({
  pathType,
  lesson,
  level,
  unit,
  language,
  isReviewLocked,
  suggestedLessonId,
  onClick,
  maxLevelPerLesson = 10,
  isMobileLayout = false
}: SharedLessonCardProps) {
  const [activeTab, setActiveTab] = useState<'words' | 'phrases'>('words');
  const [isHovered, setIsHovered] = useState(false);

  const isMaxLevel = level >= maxLevelPerLesson;
  const displayLevel = Math.min(level, maxLevelPerLesson);
  const isSuggested = suggestedLessonId === lesson.id;

  const hasUnlockedWords = level >= 1;
  const hasUnlockedPhrases = pathType === 'speak' ? level >= 1 : level >= 2;

  const showBlockedMessage = pathType === 'learn'
    ? ((activeTab === 'words' && !hasUnlockedWords) || (activeTab === 'phrases' && !hasUnlockedPhrases))
    : pathType === 'speak'
      ? !hasUnlockedPhrases
      : false;

  const buttonText = level === 0
    ? getTranslation('auto.start_learning', language)
    : isMaxLevel
      ? getTranslation('auto.review', language)
      : getTranslation('auto.continue', language);

  const getDynamicColorClass = () => {
    if (unit.bgClass) return unit.bgClass;
    if (unit.colorClass && unit.colorClass.startsWith('text-')) return unit.colorClass.replace('text-', 'bg-');
    return unit.colorClass || 'bg-emerald-500';
  };

  const dynamicColor = getDynamicColorClass();
  const textDynamicColor = dynamicColor.replace('bg-', 'text-');
  const borderDynamicColor = dynamicColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500');
  const lightBorderDynamicColor = dynamicColor.replace('bg-', 'border-').replace(/500$/, '200').replace(/400$/, '200');
  const hoverDynamicColor = isReviewLocked ? '' : (unit.hoverClass || 'hover:brightness-110');

  const cardStyle = cn(
    "relative w-full transition-all duration-300 cursor-pointer border-[2px]",
    isHovered ? "shadow-md -translate-y-1" : "shadow-sm",
    isMaxLevel ? `${borderDynamicColor} bg-white` :
      isReviewLocked ? "bg-slate-50/50 border-slate-100" :
        isSuggested ? "border-amber-100 bg-amber-50/10" : "border-slate-100 bg-white/80"
  );

  // Renders the fragmented progress bar (horizontal dashes for mobile)
  const renderMobileProgressBar = () => (
    <div className="flex justify-between gap-1 w-full mt-0.5">
      {Array.from({ length: maxLevelPerLesson }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 sm:h-2.5 flex-1 rounded-full transition-all",
            i < level ? dynamicColor : 'bg-slate-100'
          )}
        />
      ))}
    </div>
  );

  // Renders the fragmented progress bar (horizontal dashes for desktop)
  const renderDesktopProgressBar = () => (
    <div className="flex justify-between gap-1 w-full mt-0.5">
      {Array.from({ length: maxLevelPerLesson }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2.5 flex-1 rounded-full transition-all",
            i < level ? dynamicColor : 'bg-slate-100'
          )}
        />
      ))}
    </div>
  );

  // Middle section content renderer based on pathType
  const renderMiddleSection = () => {
    if (pathType === 'alphabet') {
      return (
        <>
          {/* Left: Letters box */}
          {isMobileLayout && (
            <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-50 border border-slate-100 flex items-center justify-center text-3xl font-thai text-slate-600">
              <div className="flex flex-wrap items-center justify-center p-2 leading-none gap-1">
                {lesson.items?.map((i: any) => formatCombiningChar(i.letter)).join('')}
              </div>
              {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]"><Star size={28} className="text-white fill-white/50" /></div>}
            </div>
          )}

          {/* Right: Letters List */}
          <div className="flex-1 min-w-0 bg-slate-50/50 rounded-2xl p-2 flex flex-col cursor-default border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex bg-slate-100/50 p-1 rounded-xl w-full mb-1 justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 py-1">{getTranslation('auto.letters', language) || "Lettres"}</span>
            </div>
            <div className="flex flex-col gap-1 sm:gap-2 px-1 sm:px-2 pb-1 sm:pb-2 min-h-[50px] max-h-[85px] sm:max-h-[120px] overflow-y-auto hide-scrollbar">
              {lesson.items?.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between text-[11px] sm:text-sm border-b border-slate-100 last:border-0 pb-0.5 sm:pb-1.5 last:pb-0 gap-1 sm:gap-3 shrink-0">
                  <span className="font-thai text-sm sm:text-2xl font-bold text-slate-700 w-auto sm:w-8 text-center">{formatCombiningChar(p.letter)}</span>
                  <div className="flex flex-col text-right sm:text-left min-w-0 flex-1">
                    <span className="font-bold text-slate-700 truncate">{p.pronunciation}</span>
                    <span className="text-slate-400 text-[9px] sm:text-xs truncate">{getLocalizedField(p, 'exampleTranslation', language)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      );
    }

    if (pathType === 'speak') {
      return (
        <>
          {/* Left: Image */}
          {isMobileLayout && lesson.imageUrl && (
            <div className="w-[84px] h-[84px] sm:w-[96px] sm:h-[96px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-50 border border-slate-100 flex items-center justify-center">
              <IconImage src={lesson.imageUrl} alt={lesson.title} fill className="object-cover" sizes="96px" />
              {isReviewLocked && <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 backdrop-blur-[2px]"><Star size={28} className="text-white fill-white/50" /></div>}
            </div>
          )}

          {/* Right: Phrases List */}
          <div className="flex-1 min-w-0 bg-slate-50/50 rounded-2xl p-2 flex flex-col cursor-default border border-slate-100" onClick={(e) => e.stopPropagation()}>
            <div className="flex bg-slate-100/50 p-1 rounded-xl w-full mb-1 justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 py-1">{getTranslation('auto.phrases', language) || "Phrases"}</span>
            </div>
            <div className="flex flex-col gap-1 sm:gap-2 px-1 sm:px-2 pb-1 sm:pb-2 min-h-[50px] max-h-[85px] sm:max-h-[120px] overflow-y-auto hide-scrollbar">
              {showBlockedMessage ? (
                <span className="text-[10px] sm:text-sm font-medium leading-tight text-slate-400 italic text-center mt-2 px-1">
                  {getTranslation('auto.unlock_levels_for_phrases', language) || "Débloquez plus de niveaux pour voir les phrases."}
                </span>
              ) : lesson.phrases && lesson.phrases.length > 0 ? (
                lesson.phrases.map((p: any, i: number) => (
                  <div key={i} className="flex flex-col text-[11px] sm:text-sm border-b border-slate-100 last:border-0 pb-0.5 sm:pb-1.5 last:pb-0 shrink-0">
                    <span className="font-semibold text-slate-700 truncate pr-1">{p.phonetic || p.th}</span>
                    <span className="text-slate-400 truncate text-[10px] sm:text-xs">{getLocalizedField(p, '', language)}</span>
                  </div>
                ))
              ) : (
                <span className="text-[10px] sm:text-sm font-medium leading-tight text-slate-400 italic text-center mt-2 px-1">
                  {getTranslation('auto.no_phrase', language) || "Aucune phrase"}
                </span>
              )}
            </div>
          </div>
        </>
      );
    }

    // Default: 'learn'
    return (
      <>
        {/* Left: Image */}
        {isMobileLayout && lesson.imageUrl && (
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
              className={cn("flex-1 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all", activeTab === 'words' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              {getTranslation('auto.words', language) || "Mots"}
            </button>
            <button
              onClick={() => setActiveTab('phrases')}
              className={cn("flex-1 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold rounded-lg transition-all", activeTab === 'phrases' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700')}
            >
              {getTranslation('auto.phrases', language) || "Phrases"}
            </button>
          </div>
          <div className="flex flex-col gap-1 sm:gap-2 px-1 sm:px-2 pb-1 sm:pb-2 min-h-[50px] max-h-[85px] sm:max-h-[120px] overflow-y-auto hide-scrollbar">
            {showBlockedMessage ? (
              <span className="text-[10px] sm:text-sm font-medium leading-tight text-slate-400 italic text-center mt-2 px-1">
                {activeTab === 'words' ? (getTranslation('auto.unlock_levels_for_words', language) || "Débloquez plus de niveaux pour voir les mots.") : (getTranslation('auto.unlock_levels_for_phrases', language) || "Débloquez plus de niveaux pour voir les phrases.")}
              </span>
            ) : activeTab === 'words' ? (
              lesson.words?.filter((w: any) => w.th !== '...' && w.phonetic !== '...').map((w: any, i: number) => (
                <div key={i} className="flex justify-between items-center text-[11px] sm:text-sm border-b border-slate-100 last:border-0 pb-0.5 sm:pb-1.5 last:pb-0 shrink-0">
                  <span className="font-medium text-slate-700 pr-1 font-thai text-sm sm:text-base">{w.th || w.phonetic}</span>
                  <span className="text-slate-400 truncate text-right">{getLocalizedField(w, '', language)}</span>
                </div>
              ))
            ) : (
              lesson.phrases?.filter((p: any) => p.th !== '...' && p.phonetic !== '...').map((p: any, i: number) => (
                <div key={i} className="flex flex-col text-[11px] sm:text-sm border-b border-slate-100 last:border-0 pb-0.5 sm:pb-1.5 last:pb-0 shrink-0">
                  <span className="font-medium text-slate-700 truncate font-thai text-sm sm:text-base">{p.th || p.phonetic}</span>
                  <span className="text-slate-400 truncate text-[10px] sm:text-xs">{getLocalizedField(p, '', language)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  const renderDescription = () => {
    if (pathType === 'alphabet') {
      return lesson.items?.map((i: any) => formatCombiningChar(i.letter)).join(' • ');
    }
    return getLocalizedField(lesson, 'description', language);
  };

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
          <div className="flex flex-col items-start text-left flex-1 pr-2 overflow-hidden w-full">
            <Typography variant="h4" className="text-lg sm:text-xl w-full">
              {getLocalizedField(lesson, 'title', language)}
            </Typography>
            <Typography variant="muted" className="text-xs font-medium mt-0.5 w-full">
              {renderDescription()}
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

        {/* Middle Section */}
        <div className="flex flex-row-reverse gap-4 w-full items-center mt-1">
          {renderMiddleSection()}
        </div>

        {/* Bottom: Progress Bar & Button (Mobile side-by-side) */}
        <div className="flex items-center justify-between w-full mt-2 gap-4">
          <div className="flex-1 flex flex-col gap-0.5 min-w-0 pr-2">
            <div className="flex justify-between text-[10px] sm:text-[11px] uppercase font-bold tracking-wider text-slate-400">
              <span className="font-extrabold">{getTranslation('auto.mastery_6', language)}</span>
              <span className={cn(textDynamicColor, "font-black")}>{displayLevel}/{maxLevelPerLesson}</span>
            </div>
            {renderMobileProgressBar()}
          </div>

          <Button
            variant={"gamified" as const}
            size="sm"
            className={cn("shrink-0 px-4 sm:px-6 shadow-none text-white", dynamicColor, borderDynamicColor, isReviewLocked ? 'opacity-50 pointer-events-none' : '')}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {buttonText}
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
          <Typography variant="h3" className="w-full">
            {getLocalizedField(lesson, 'title', language)}
          </Typography>
          <Typography variant="muted" className="mt-1 w-full">
            {renderDescription()}
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

      <div className="w-full flex flex-col gap-1 mt-1">
        <div className="flex justify-between text-xs font-bold tracking-wider uppercase px-1">
          <span className="text-slate-400">{getTranslation('auto.mastery_6', language)}</span>
          <span className={cn(textDynamicColor, "font-black")}>{displayLevel}/{maxLevelPerLesson}</span>
        </div>
        <div className="px-1">
          {renderDesktopProgressBar()}
        </div>
      </div>

      <div className="flex flex-row gap-4 w-full items-stretch mt-1">
        {renderMiddleSection()}
      </div>

      <Button
        variant={"gamified" as const}
        size="lg"
        className={cn("w-full mt-2 shadow-none text-white cursor-pointer transition-colors duration-200", dynamicColor, borderDynamicColor, hoverDynamicColor, isReviewLocked ? 'opacity-50 pointer-events-none' : '')}
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
