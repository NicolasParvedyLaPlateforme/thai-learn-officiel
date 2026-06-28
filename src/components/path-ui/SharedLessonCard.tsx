'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getLocalizedField, getTranslation } from "@/hooks/useTranslation";
import { CheckCircle, Crown, Star, ChevronDown } from 'lucide-react';
import IconImage from '../ui/IconImage';
import { Card } from "@/components/ui/Card";
import { Typography } from "@/components/ui/Typography";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { formatCombiningChar } from "@/lib/alphabet-utils";
import { AnimatePresence, m, useInView } from 'framer-motion';
import { SegmentedProgressBorder } from './SegmentedProgressBorder';

// ───────────────────────────────────────────────────────────────────────────────
// Scrolling handled locally via IntersectionObserver in the component
// ───────────────────────────────────────────────────────────────────────────────



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
  index?: number;
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
  isMobileLayout = false,
  index
}: SharedLessonCardProps) {
  const [activeTab, setActiveTab] = useState<'words' | 'phrases'>('words');
  const [isHovered, setIsHovered] = useState(false);

  // ── Mobile-specific state ──────────────────────────────────────────────────
  const [scrollIndex, setScrollIndex] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const hasUnlockedWords = level >= 1;
  const hasUnlockedPhrases = pathType === 'speak' ? level >= 1 : level >= 2;

  // Build the list of items to rotate, respecting unlock conditions
  const getMobileItems = useCallback(() => {
    if (pathType === 'alphabet') {
      if (!hasUnlockedWords) return [];
      return (lesson.items || [])
        .filter((i: any) => i.letter)
        .map((i: any) => ({ thai: formatCombiningChar(i.letter), translation: i.pronunciation || '', isPhrase: false }));
    }
    if (pathType === 'speak') {
      if (!hasUnlockedPhrases) return [];
      return (lesson.phrases || [])
        .filter((p: any) => p.th !== '...' && p.phonetic !== '...')
        .map((p: any) => ({ thai: p.th || p.phonetic, translation: getLocalizedField(p, '', language), isPhrase: true }));
    }
    // 'learn': show words from level 1, add phrases from level 2
    const words = hasUnlockedWords
      ? (lesson.words || [])
        .filter((w: any) => w.th !== '...' && w.phonetic !== '...')
        .map((w: any) => ({ thai: w.th || w.phonetic, translation: getLocalizedField(w, '', language), isPhrase: false }))
      : [];
    const phrases = hasUnlockedPhrases
      ? (lesson.phrases || [])
        .filter((p: any) => p.th !== '...' && p.phonetic !== '...')
        .map((p: any) => ({ thai: p.th || p.phonetic, translation: getLocalizedField(p, '', language), isPhrase: true }))
      : [];
    // interleave
    const result: typeof words = [];
    const maxLen = Math.max(words.length, phrases.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < words.length) result.push(words[i]);
      if (i < phrases.length) result.push(phrases[i]);
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathType, lesson, language, hasUnlockedWords, hasUnlockedPhrases]);

  const mobileItems = getMobileItems();

  // Start scrolling interval if visible
  useEffect(() => {
    if (!isMobileLayout || mobileItems.length <= 1) return;
    const el = cardRef.current;
    if (!el) return;

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = setInterval(() => {
        setScrollIndex(prev => (prev + 1) % mobileItems.length);
      }, 3000);
    };
    const stop = () => {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileLayout, mobileItems.length, lesson.id]);


  // ── Shared derived values ─────────────────────────────────────────────────
  const isMaxLevel = level >= maxLevelPerLesson;
  const displayLevel = Math.min(level, maxLevelPerLesson);
  const isSuggested = suggestedLessonId === lesson.id;

  // hasUnlockedWords / hasUnlockedPhrases already declared above (mobile section)

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

  const colorMatch = dynamicColor.match(/bg-([a-z]+)-/);
  const colorName = colorMatch ? colorMatch[1] : 'emerald';

  const COLOR_VARIANTS: Record<string, { bg100: string, bg50: string, border200: string, text700: string, bgOverlay: string }> = {
    emerald: { bg100: 'bg-emerald-100', bg50: 'bg-emerald-50', border200: 'border-emerald-200', text700: 'text-emerald-700', bgOverlay: 'bg-emerald-600/80' },
    amber: { bg100: 'bg-amber-100', bg50: 'bg-amber-50', border200: 'border-amber-200', text700: 'text-amber-700', bgOverlay: 'bg-amber-600/80' },
    yellow: { bg100: 'bg-yellow-100', bg50: 'bg-yellow-50', border200: 'border-yellow-200', text700: 'text-yellow-700', bgOverlay: 'bg-yellow-600/80' },
    rose: { bg100: 'bg-rose-100', bg50: 'bg-rose-50', border200: 'border-rose-200', text700: 'text-rose-700', bgOverlay: 'bg-rose-600/80' },
    blue: { bg100: 'bg-blue-100', bg50: 'bg-blue-50', border200: 'border-blue-200', text700: 'text-blue-700', bgOverlay: 'bg-blue-600/80' },
    indigo: { bg100: 'bg-indigo-100', bg50: 'bg-indigo-50', border200: 'border-indigo-200', text700: 'text-indigo-700', bgOverlay: 'bg-indigo-600/80' },
    violet: { bg100: 'bg-violet-100', bg50: 'bg-violet-50', border200: 'border-violet-200', text700: 'text-violet-700', bgOverlay: 'bg-violet-600/80' },
    purple: { bg100: 'bg-purple-100', bg50: 'bg-purple-50', border200: 'border-purple-200', text700: 'text-purple-700', bgOverlay: 'bg-purple-600/80' },
    fuchsia: { bg100: 'bg-fuchsia-100', bg50: 'bg-fuchsia-50', border200: 'border-fuchsia-200', text700: 'text-fuchsia-700', bgOverlay: 'bg-fuchsia-600/80' },
    pink: { bg100: 'bg-pink-100', bg50: 'bg-pink-50', border200: 'border-pink-200', text700: 'text-pink-700', bgOverlay: 'bg-pink-600/80' },
    red: { bg100: 'bg-red-100', bg50: 'bg-red-50', border200: 'border-red-200', text700: 'text-red-700', bgOverlay: 'bg-red-600/80' },
    orange: { bg100: 'bg-orange-100', bg50: 'bg-orange-50', border200: 'border-orange-200', text700: 'text-orange-700', bgOverlay: 'bg-orange-600/80' },
    cyan: { bg100: 'bg-cyan-100', bg50: 'bg-cyan-50', border200: 'border-cyan-200', text700: 'text-cyan-700', bgOverlay: 'bg-cyan-600/80' },
    teal: { bg100: 'bg-teal-100', bg50: 'bg-teal-50', border200: 'border-teal-200', text700: 'text-teal-700', bgOverlay: 'bg-teal-600/80' },
    green: { bg100: 'bg-green-100', bg50: 'bg-green-50', border200: 'border-green-200', text700: 'text-green-700', bgOverlay: 'bg-green-600/80' },
  };

  const badgeTheme = COLOR_VARIANTS[colorName] || COLOR_VARIANTS['emerald'];
  const badgeBgColor = badgeTheme.bg100;
  const badgeTextColor = badgeTheme.text700;
  const badgeBorderColor = badgeTheme.border200;
  const itemBgColor = badgeTheme.bg50;    // very light background for rotating item
  const overlayColor = badgeTheme.bgOverlay; // semi-opaque color overlay on image for text

  const isStarted = level > 0 && !isMaxLevel;

  // For mobile: mastered (isMaxLevel) have no border. Not-started (level===0) have no border unless suggested.
  const mobileNoBorderShadow = isMobileLayout && (isMaxLevel || (level === 0 && !isSuggested)) && !isReviewLocked;

  const isInView = useInView(cardRef, { amount: 0.85 });

  const cardStyle = cn(
    "relative w-full cursor-pointer",
    isMobileLayout ? "transition-all duration-500 ease-out" : "transition-all duration-300",
    isMobileLayout && !isInView ? "opacity-0 -translate-x-16 scale-95" : "opacity-100 translate-x-0 scale-100",
    mobileNoBorderShadow
      ? "border-0 shadow-none bg-white"
      : cn(
        "border-[2px]",
        isHovered ? "shadow-md -translate-y-1" : "shadow-sm",
        isMaxLevel ? `${badgeBorderColor} bg-white` :
          isStarted ? `${borderDynamicColor} bg-white` :
            isReviewLocked ? "bg-slate-50/50 border-slate-100" :
              isSuggested ? "border-amber-100 bg-amber-50/10" : "border-slate-100 bg-white/80"
      )
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

  // Middle section content renderer based on pathType (desktop only)
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

  // ─────────────────────────────────────────────────────────────────────────────
  // MOBILE LAYOUT (redesigned)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isMobileLayout) {
    const currentItem = mobileItems[scrollIndex] ?? null;

    return (
      <Card
        ref={cardRef as React.Ref<HTMLDivElement>}
        className={cn(cardStyle, "relative flex flex-col rounded-[20px] p-0 bg-transparent border-0 overflow-visible")}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
      >
        {/* SVG Segmented Border (Only if not mastered and not 0 levels) */}
        {!isMaxLevel && maxLevelPerLesson > 0 && (
          <SegmentedProgressBorder 
            maxLevel={maxLevelPerLesson} 
            currentLevel={displayLevel} 
            colorClass={textDynamicColor}
            radius={20} // 20px for rounded-[20px]
          />
        )}

        {/* ── Header: Image Left, Title/Desc Right ──────────────────────────────── */}
        <div className={cn("flex p-3 pt-[14px] gap-3 border-b border-slate-100 relative bg-transparent items-center flex-col z-10")}>
          {/* Mastered badge */}
          {isMaxLevel && (
            <div
              className={cn("z-20 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-bold text-[10px] border bg-white ", badgeTextColor, badgeBorderColor)}
            >
              <Crown size={12} className={badgeTextColor} fill="currentColor" />
              <span className={badgeTextColor}>{getTranslation('auto.mastered', language)}</span>
            </div>
          )}

          {/* Suggested badge (if any, matching desktop logic) */}
          {!isMaxLevel && isSuggested && (
            <div
              className="z-20 flex items-center gap-1 px-2 py-0.5 rounded-full shadow-sm font-bold text-[10px] border bg-amber-100 text-amber-700 border-amber-200"
            >
              <Star size={10} fill="currentColor" />
              <span>{getTranslation('auto.suggested', language)}</span>
            </div>
          )}

          <div className="flex flex-col justify-center min-w-0 flex-1">
            <Typography variant="h4" className="text-slate-800 text-sm sm:text-base font-bold leading-tight line-clamp-2 text-center">
              {getLocalizedField(lesson, 'title', language)}
            </Typography>
            <Typography variant="muted" className="text-slate-500 text-[11px] sm:text-xs leading-snug line-clamp-2 font-medium mt-1 text-center">
              {renderDescription()}
            </Typography>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 px-3 pt-2.5 pb-3 bg-white rounded-b-[20px] ">

          {/* Rotating word / phrase strip – framer-motion animated */}
          {mobileItems.length > 0 && (
            <div
              className="flex items-center justify-center overflow-hidden relative"
              style={{ height: '2.25rem' }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence mode="wait">
                <m.div
                  key={scrollIndex}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  className="absolute flex items-center justify-center gap-2 w-full min-w-0"
                >
                  <span className={cn("font-thai text-base font-bold leading-none truncate shrink-0", badgeTextColor)}>
                    {currentItem?.thai}
                  </span>
                  <span className="text-slate-400 text-sm truncate min-w-0">
                    {currentItem?.translation}
                  </span>
                </m.div>
              </AnimatePresence>
            </div>
          )}

          {/* Progress bar + Button */}
          <div className="flex items-center justify-between w-full gap-4 flex-col z-10 mt-1">
            <Button
              variant={isMaxLevel ? "outline" : "gamified"}
              size="sm"
              className={cn("shrink-0 px-4 sm:px-6 shadow-sm w-full transition-all duration-200 flex items-center justify-center gap-2", 
                isMaxLevel ? "border-2 text-slate-700 bg-white hover:bg-slate-50" : cn("text-white", dynamicColor, borderDynamicColor, hoverDynamicColor),
                isReviewLocked ? 'opacity-50 pointer-events-none' : ''
              )}
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {buttonText}
              {!isMaxLevel && <ChevronDown size={18} className="stroke-[3]" />}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // DESKTOP LAYOUT (redesigned horizontal)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Card
      ref={cardRef as React.Ref<HTMLDivElement>}
      className={cn("relative p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-6 rounded-[2rem] bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow group overflow-visible",
        !isMaxLevel ? "border-0" : "border border-slate-200",
        isReviewLocked ? "opacity-50 pointer-events-none" : ""
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {/* SVG Segmented Border (Only if not mastered and not 0 levels) */}
      {!isMaxLevel && maxLevelPerLesson > 0 && (
        <SegmentedProgressBorder 
          maxLevel={maxLevelPerLesson} 
          currentLevel={displayLevel} 
          colorClass={textDynamicColor}
          radius={32} // 32px for rounded-[2rem]
        />
      )}

      {/* Badges (Top Centered) */}
      {isMaxLevel ? (
        <Badge className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-sm px-3 py-1 gap-1 z-10 font-bold border-[2px] shrink-0", badgeBgColor, badgeTextColor, badgeBorderColor)}>
          <CheckCircle size={14} /> {getTranslation('auto.mastered', language)}
        </Badge>
      ) : isSuggested ? (
        <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-600 shadow-sm px-3 py-1 gap-1 z-10 font-bold border-[2px] border-rose-200 shrink-0 uppercase tracking-wider text-[10px]">
          {getTranslation('auto.in_progress', language) || "En cours"}
        </Badge>
      ) : displayLevel > 0 ? (
        <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-600 shadow-sm px-3 py-1 gap-1 z-10 font-bold border-[2px] border-rose-200 shrink-0 uppercase tracking-wider text-[10px]">
          {getTranslation('auto.in_progress', language) || "En cours"}
        </Badge>
      ) : null}

      {/* Left: Circular Image Icon */}
      {lesson.imageUrl ? (
        <div className="w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-full overflow-hidden shrink-0 relative bg-slate-50 border-[3px] border-slate-100 flex items-center justify-center z-10 shadow-sm group-hover:scale-105 transition-transform duration-300">
          <IconImage src={lesson.imageUrl} alt={lesson.title} fill className="object-cover" sizes="84px" />
        </div>
      ) : (
        <div className={cn("w-[64px] h-[64px] sm:w-[84px] sm:h-[84px] rounded-full shrink-0 relative flex items-center justify-center z-10 shadow-sm border-[3px] border-white group-hover:scale-105 transition-transform duration-300", badgeBgColor, badgeTextColor)}>
          <span className="font-thai text-3xl font-bold">{lesson.items?.[0]?.letter?.[0] || lesson.title?.[0]}</span>
        </div>
      )}

      {/* Middle: Content */}
      <div className="flex flex-col items-start text-left flex-1 min-w-0 z-10 py-1">
        <Typography variant="h3" className="w-full text-base sm:text-lg lg:text-xl font-bold text-slate-800 line-clamp-1">
          {getLocalizedField(lesson, 'title', language)}
        </Typography>
        <Typography variant="muted" className="mt-0.5 w-full text-xs sm:text-sm text-slate-500 line-clamp-2 pr-2">
          {renderDescription()}
        </Typography>
        
        {/* Phonetic / preview block */}
        {pathType === 'learn' && hasUnlockedWords && lesson.words?.[0] && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className={cn("font-thai font-bold", textDynamicColor)}>{lesson.words[0].th || lesson.words[0].phonetic}</span>
            <span className="text-slate-400">{getLocalizedField(lesson.words[0], '', language)}</span>
          </div>
        )}
        {pathType === 'speak' && hasUnlockedPhrases && lesson.phrases?.[0] && (
          <div className="flex items-center gap-2 mt-2 text-sm">
            <span className={cn("font-thai font-bold", textDynamicColor)}>{lesson.phrases[0].th || lesson.phrases[0].phonetic}</span>
            <span className="text-slate-400">{getLocalizedField(lesson.phrases[0], '', language)}</span>
          </div>
        )}
      </div>

      {/* Right: Button */}
      <div className="shrink-0 z-10 ml-auto flex flex-col items-end gap-1">
        <Button
          variant={isMaxLevel ? "outline" : "gamified"}
          size="lg"
          className={cn("px-6 shadow-sm transition-all duration-200 min-w-[140px] justify-center flex items-center gap-2", 
            isMaxLevel ? "border-2 text-slate-700 bg-white hover:bg-slate-50" : cn("text-white", dynamicColor, borderDynamicColor, hoverDynamicColor)
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          {buttonText}
          {!isMaxLevel && <ChevronDown size={18} className="stroke-[3]" />}
        </Button>
      </div>

    </Card>
  );
}
