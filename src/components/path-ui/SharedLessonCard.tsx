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
    if (mobileItems.length <= 1) return;
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

  const renderDescription = () => {
    if (pathType === 'alphabet') {
      return lesson.items?.map((i: any) => formatCombiningChar(i.letter)).join(' • ');
    }
    return getLocalizedField(lesson, 'description', language);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // UNIFIED HORIZONTAL LAYOUT (Desktop & Mobile)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <Card
      ref={cardRef as React.Ref<HTMLDivElement>}
      className={cn("relative p-4 sm:p-6 flex flex-row items-center gap-4 sm:gap-6 rounded-[2rem] bg-white cursor-pointer shadow-sm hover:shadow-md transition-shadow group overflow-visible",
        !isMaxLevel ? "border-0" : "border border-slate-200",
        isReviewLocked ? "opacity-50 pointer-events-none" : "",
        isMobileLayout ? "pb-10" : ""
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
        <Badge className={cn("absolute -top-3.5 left-1/2 -translate-x-1/2 shadow-sm px-3 py-1 gap-1 z-100 font-bold border-[2px] shrink-0", badgeBgColor, badgeTextColor, badgeBorderColor)}>
          <CheckCircle size={14} /> {getTranslation('auto.mastered', language)}
        </Badge>
      ) : isSuggested ? (
        <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-600 shadow-sm px-3 py-1 gap-1 z-100 font-bold border-[2px] border-rose-200 shrink-0 uppercase tracking-wider text-[10px]">
          {getTranslation('auto.in_progress', language) || "En cours"}
        </Badge>
      ) : displayLevel > 0 ? (
        <Badge className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-50 text-rose-600 shadow-sm px-3 py-1 gap-1 z-100 font-bold border-[2px] border-rose-200 shrink-0 uppercase tracking-wider text-[10px]">
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
        <Typography variant="h3" className="w-full text-base sm:text-lg lg:text-xl font-bold text-slate-800">
          {getLocalizedField(lesson, 'title', language)}
        </Typography>
        <Typography variant="muted" className="mt-0.5 w-full text-xs sm:text-sm text-slate-500 pr-2">
          {renderDescription()}
        </Typography>

        {/* Phonetic / preview block */}
        {mobileItems.length > 0 && (
          <div className="flex items-center mt-2 overflow-hidden relative w-full" style={{ height: '1.5rem' }}>
            <AnimatePresence mode="wait">
              <m.div
                key={scrollIndex}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                className="absolute flex items-center gap-2 w-full min-w-0 left-0"
              >
                <span className={cn("font-thai text-sm font-bold leading-none truncate shrink-0", textDynamicColor)}>
                  {mobileItems[scrollIndex]?.thai}
                </span>
                <span className="text-slate-400 text-xs truncate min-w-0">
                  {mobileItems[scrollIndex]?.translation}
                </span>
              </m.div>
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Button */}
      <div className={cn("shrink-0 z-10 flex flex-col items-end gap-1 z-100",
        isMobileLayout ? "absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 max-w-[200px]" : "ml-auto"
      )}>
        <Button
          variant={isMaxLevel ? "outline" : "gamified"}
          size={isMobileLayout ? "default" : "lg"}
          className={cn("px-4 sm:px-6 shadow-sm transition-all duration-200 justify-center flex items-center gap-2 w-full",
            !isMobileLayout && "sm:min-w-[140px]",
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
