import React, { useEffect, useState } from 'react';
import { LessonPathNode } from './LessonPathNode';
import { getLevelSplit } from '@/lib/levelSplits';
import { useProgressStore } from "@/lib/store";
import { getTranslation } from "@/hooks/useTranslation";
import { Lock } from 'lucide-react';

interface LessonPathMapProps {
  maxLevel: number;
  currentProgress: number;
  modalLevel: number | null;
  setModalLevel: (lvl: number) => void;
  earnedStarsArray: number[];
  unitColor: string;
  unitBorder: string;
  unitText: string;
  language: string;
  lessonId?: string;
  lesson?: any;
  lessonPartsCompleted?: Record<string, number[]>;
  suggestionType?: string;
  initialScrollLevel?: number;
  disableAutoScroll?: boolean;
  onReady?: () => void;
  onBack?: () => void;
  isLeft?: boolean;
}

export function LessonPathMap({
  maxLevel,
  currentProgress,
  modalLevel,
  setModalLevel,
  earnedStarsArray,
  unitColor,
  unitBorder,
  unitText,
  language,
  lessonId,
  lesson,
  lessonPartsCompleted,
  suggestionType,
  initialScrollLevel,
  disableAutoScroll,
  onReady,
  onBack,
  isLeft
}: LessonPathMapProps) {
  const nodes = Array.from({ length: maxLevel + 1 }).map((_, i) => i);

  const fullLevelsCompleted = useProgressStore(state => state.fullLevelsCompleted);
  const currentFullLevels = lessonId ? (fullLevelsCompleted[lessonId] || []) : [];

  let maxAccessibleLevel = 0;
  let blockedByLevel: number | null = null;
  let blockingReason: string | null = null;

  const isPartCompleted = (l: number, p: number) => {
    const key = `${lessonId}_level-${l}`;
    const parts = lessonPartsCompleted?.[key] || [];
    return parts.includes(p);
  };

  for (let l = 1; l <= maxLevel; l++) {
    const isVerticalMet = isPartCompleted(l - 1, 0);
    if (!isVerticalMet) {
      blockingReason = `${getTranslation('auto.complete_part_1_of_level', language) || 'Terminez la partie 1 du Niveau '}${l}${getTranslation('auto.to_unlock', language) || ' pour débloquer.'}`;
      break;
    }

    let isBlocked = false;
    if (suggestionType === 'learn' && l >= 4) {
      for (let i = 4; i <= l; i++) {
        if (!currentFullLevels.includes(i - 4)) {
          isBlocked = true;
          blockedByLevel = blockedByLevel === null ? i : blockedByLevel;
          blockingReason = `${getTranslation('auto.complete_level', language) || 'Terminez le Niveau '}${i - 3}${getTranslation('auto.full_to_unlock', language) || ' (entier) pour débloquer.'}`;
          break;
        }
      }
      
      if (l === 4) {
          const partsL3 = lesson ? getLevelSplit(3, lesson) : 1;
          const completedL3 = lessonPartsCompleted?.[`${lessonId}_level-3`] || [];
          if (completedL3.length < partsL3) {
              isBlocked = true;
              if (!blockingReason) blockingReason = getTranslation('auto.complete_all_parts_level_4', language) || `Terminez toutes les parties du Niveau 4 pour débloquer.`;
          }
      }
    }

    if (isBlocked) break;
    maxAccessibleLevel = l;
  }

  const effectiveProgress = maxAccessibleLevel;
  let calculatedTarget = effectiveProgress > maxLevel ? maxLevel : effectiveProgress;
  
  if (blockedByLevel !== null) {
      calculatedTarget = blockedByLevel - 4;
  }

  const targetScrollLevel = initialScrollLevel !== undefined && initialScrollLevel !== null ? initialScrollLevel : calculatedTarget;
  
  const [activeLevel, setActiveLevel] = useState<number>(targetScrollLevel);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showLockMessageFor, setShowLockMessageFor] = useState<number | null>(null);

  const handleLevelChange = (l: number) => {
    if (l !== activeLevel) {
      setIsFadingOut(true);
      setTimeout(() => {
        setActiveLevel(l);
        setIsFadingOut(false);
      }, 200);
    }
  };

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const getImageNameForLevel = (index: number) => {
    switch (index) {
      case 0: return 'find-the-good-traduction-removebg-preview.png';
      case 1: return 'complete-the-sentence.png';
      case 2: return 'build-your-sentence-removebg.png';
      case 3: return 'build-your-sentence-removebg.png';
      case 4: return 'niveau-5-nobg.png';
      case 5: return 'level-6-nobg.png';
      case 6: return 'level-7-nobg.png';
      case 7: return 'level-8-nobg.png';
      case 8: return 'level-9-nobg.png';
      case 9: return 'level-10-nobg.png';
      default: return null;
    }
  };

  const getMobileOffset = () => 0;
  const getOffset = () => 0;
  const generatePath = () => "";

  const isLevelUnlocked = (l: number) => l <= effectiveProgress;

  return (
    <div className="flex flex-col lg:flex-row-reverse items-center justify-start lg:justify-center w-full max-w-5xl mx-auto lg:gap-16 pt-4 pb-0">
      {/* Level Selector */}
      <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start gap-4 mb-10 lg:mb-0 mt-6 lg:mt-12 px-4 content-start">
        {suggestionType === 'learn' && (
          <h3 className={`text-xl md:text-2xl font-extrabold text-center lg:text-left px-2 leading-tight w-full ${activeLevel >= 10 ? 'text-amber-500' : 'text-slate-700'}`}>
            {activeLevel < 10 
              ? (getTranslation(`levelTitle.${activeLevel + 1}`, language) || `Niveau ${activeLevel + 1}`) 
              : (getTranslation(`levelTitle.11`, language) || `Niveau Ultime`)
            }
          </h3>
        )}
        <div className="flex flex-wrap justify-center lg:justify-start gap-3 lg:gap-4 w-full">
        {nodes.map((l) => {
          const unlocked = isLevelUnlocked(l);
          const isNextLocked = l === (blockedByLevel !== null ? blockedByLevel : effectiveProgress + 1);
          
          const isSelected = activeLevel === l;
          const label = l === maxLevel && maxLevel > 4 ? (getTranslation('auto.ultimate', language) || 'Ultime') : `${l + 1}`;
          
          let buttonClass = "px-4 py-2 rounded-xl font-bold text-[15px] transition-all ";
          
          if (unlocked) {
            if (isSelected) {
              buttonClass += `${unitColor} text-white shadow-lg scale-110 border-2 border-transparent`;
            } else {
              buttonClass += "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm";
            }
          } else if (isNextLocked) {
            // Mise en évidence du prochain niveau à débloquer
            buttonClass += "bg-slate-50 text-slate-500 border-2 border-dashed border-slate-400 hover:bg-slate-100 hover:border-slate-500 shadow-sm cursor-help";
          } else {
            buttonClass += "bg-slate-100 text-slate-400 border-2 border-slate-100 cursor-not-allowed opacity-50";
          }

          return (
            <div key={l} className="relative flex flex-col items-center">
              <button
                onClick={() => {
                  if (unlocked) {
                    handleLevelChange(l);
                    setShowLockMessageFor(null);
                  } else if (isNextLocked) {
                    setShowLockMessageFor(l);
                    setTimeout(() => setShowLockMessageFor(null), 3000);
                  }
                }}
                className={buttonClass}
              >
                {label}
                {isNextLocked && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-400 border-2 border-white"></span>
                  </span>
                )}
              </button>
              
              {/* Lock Message Tooltip */}
              {showLockMessageFor === l && isNextLocked && (
                <div className={`absolute top-full mt-3 w-max max-w-[220px] bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-50 text-center animate-in fade-in zoom-in-95
                  ${l >= maxLevel - 1 ? 'right-0 md:left-1/2 md:-translate-x-1/2' : (l <= 1 ? 'left-0 md:left-1/2 md:-translate-x-1/2' : 'left-1/2 -translate-x-1/2')}
                `}>
                  {blockingReason || (getTranslation('auto.level_locked', language) || "Niveau verrouillé.")}
                  <div className={`absolute -top-1 w-2 h-2 bg-slate-800 rotate-45
                    ${l >= maxLevel - 1 ? 'right-6 md:left-1/2 md:-translate-x-1/2 md:right-auto' : (l <= 1 ? 'left-6 md:left-1/2 md:-translate-x-1/2 md:left-auto' : 'left-1/2 -translate-x-1/2')}
                  `}></div>
                </div>
              )}
            </div>
          );
        })}
        </div>
      </div>

      {/* Selected Level Node */}
      <div className={`w-full lg:w-1/2 relative mt-4 lg:mt-0 flex justify-center transition-all duration-200 ease-out ${isFadingOut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <LessonPathNode
          levelIndex={activeLevel}
          maxLevel={maxLevel}
          currentProgress={effectiveProgress}
          modalLevel={modalLevel}
          setModalLevel={setModalLevel}
          earnedStarsArray={earnedStarsArray}
          unitColor={unitColor}
          unitBorder={unitBorder}
          unitText={unitText}
          language={language}
          lessonId={lessonId}
          lesson={lesson}
          lessonPartsCompleted={lessonPartsCompleted}
          suggestionType={suggestionType}
          targetScrollLevel={targetScrollLevel}
          activeMobileLevel={activeLevel}
          nodeRefs={{ current: [] }}
          currentLevelRef={{ current: null }}
          getImageNameForLevel={getImageNameForLevel}
          getMobileOffset={getMobileOffset}
          getOffset={getOffset}
          generatePath={generatePath}
          slotHeight={290}
          blockedByLevel={blockedByLevel}
          currentFullLevels={currentFullLevels}
        />
      </div>
    </div>
  );
}
