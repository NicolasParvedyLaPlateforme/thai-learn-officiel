import React, { useEffect, useState, useRef } from 'react';
import { LessonPathNode } from './LessonPathNode';
import { getLevelSplit } from '@/lib/levelSplits';
import { useProgressStore } from "@/lib/store";
import { getTranslation } from "@/hooks/useTranslation";
import { Lock, Check, Star } from 'lucide-react';

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

  let blockedByLevel: number | null = null;

  const isPartCompleted = (l: number, p: number) => {
    const key = `${lessonId}_level-${l}`;
    const parts = lessonPartsCompleted?.[key] || [];
    return parts.includes(p);
  };

  let healedProgress = currentProgress;
  if (currentFullLevels.length > 0) {
    const maxCompletedFull = Math.max(...currentFullLevels);
    if (maxCompletedFull >= healedProgress) {
      healedProgress = maxCompletedFull + 1;
    }
  }

  // 1. Determine state of each level
  const levelStates = Array(maxLevel + 1).fill(null).map((_, i) => {
    const l = i + 1;

    let isUnlocked = false;
    let currentBlockingReason: string | null = null;

    if (i < 4) {
      isUnlocked = (i === 0) || isPartCompleted(i - 1, 0);
      if (!isUnlocked) {
        currentBlockingReason = `${getTranslation('auto.complete_part_1_of_level', language) || 'Terminez la partie 1 du Niveau '}${l - 1}${getTranslation('auto.to_unlock', language) || ' pour débloquer.'}`;
      }
    } else if (i < 10) {
      const requiredFullLevelIndex = i - 4;
      const isFullMet = currentFullLevels.includes(requiredFullLevelIndex);
      const isPartsMet = healedProgress >= i;

      isUnlocked = isFullMet && isPartsMet;
      if (!isUnlocked) {
        if (!isFullMet) {
          if (blockedByLevel === null) {
            blockedByLevel = i;
          }
          currentBlockingReason = `${getTranslation('auto.complete_level', language) || 'Terminez le Niveau '}${requiredFullLevelIndex + 1}${getTranslation('auto.full_to_unlock', language) || ' (entier) pour débloquer.'}`;
        } else {
          currentBlockingReason = `${getTranslation('auto.complete_all_parts_level', language) || 'Terminez toutes les parties du Niveau '}${i}${getTranslation('auto.to_unlock', language) || ' pour débloquer.'}`;
        }
      }
    } else {
      isUnlocked = healedProgress >= 10;
      if (!isUnlocked) {
        currentBlockingReason = `${getTranslation('auto.complete_all_parts_level', language) || 'Terminez toutes les parties du Niveau '}${10}${getTranslation('auto.to_unlock', language) || ' pour débloquer.'}`;
      }
    }
    return { isUnlocked, blockingReason: currentBlockingReason };
  });

  const firstLockedIndex = levelStates.findIndex(s => !s.isUnlocked);
  const effectiveProgress = firstLockedIndex !== -1 ? firstLockedIndex - 1 : maxLevel;

  // 2. Determine calculatedTarget (auto-scroll) using /next logic
  let calculatedTarget = maxLevel;
  let foundTarget = false;

  let targetPartIndex = 0;
  let hasMoreParts = true;
  while (hasMoreParts && !foundTarget) {
    hasMoreParts = false;
    for (const levelIndex of [0, 1, 2, 3]) {
      const isVerticallyAccessible = levelIndex === 0 || isPartCompleted(levelIndex - 1, 0);
      if (!isVerticallyAccessible) continue;

      const totalParts = lesson ? getLevelSplit(levelIndex, lesson) : 1;
      if (targetPartIndex < totalParts) {
        hasMoreParts = true;
        if (!isPartCompleted(levelIndex, targetPartIndex)) {
          calculatedTarget = levelIndex;
          foundTarget = true;
          break;
        }
      }
    }
    targetPartIndex++;
  }

  if (!foundTarget) {
    for (let i = 0; i <= 5; i++) {
      const fullLevelIndex = i;
      const partsLevelIndex = i + 4;

      if (healedProgress >= fullLevelIndex) {
        if (!currentFullLevels.includes(fullLevelIndex)) {
          calculatedTarget = fullLevelIndex;
          foundTarget = true;
          break;
        }
      }

      if (healedProgress >= partsLevelIndex) {
        if (!currentFullLevels.includes(partsLevelIndex)) {
          const totalParts = lesson ? getLevelSplit(partsLevelIndex, lesson) : 1;
          let partMissing = false;
          for (let p = 0; p < totalParts; p++) {
            if (!isPartCompleted(partsLevelIndex, p)) {
              partMissing = true;
              break;
            }
          }
          if (partMissing) {
            calculatedTarget = partsLevelIndex;
            foundTarget = true;
            break;
          }
        }
      }
    }
  }

  if (!foundTarget) {
    if (healedProgress >= 10 && !currentFullLevels.includes(10)) {
      calculatedTarget = 10;
      foundTarget = true;
    }
  }

  if (!foundTarget) {
    calculatedTarget = maxLevel;
  }

  let validInitialScroll = initialScrollLevel;
  if (initialScrollLevel !== undefined && initialScrollLevel !== null) {
    const partsLevelTotal = lesson ? getLevelSplit(initialScrollLevel, lesson) : 1;
    let isFullyCompleted = false;
    if (currentFullLevels.includes(initialScrollLevel)) {
      isFullyCompleted = true;
    } else {
      const parts = lessonPartsCompleted?.[`${lessonId}_level-${initialScrollLevel}`] || [];
      if (parts.length >= partsLevelTotal) {
        isFullyCompleted = true;
      }
    }

    if (isFullyCompleted && calculatedTarget > initialScrollLevel) {
      validInitialScroll = calculatedTarget;
    }
  }

  const targetScrollLevel = validInitialScroll !== undefined && validInitialScroll !== null ? validInitialScroll : calculatedTarget;

  const [activeLevel, setActiveLevel] = useState<number>(targetScrollLevel);
  const [nextLevel, setNextLevel] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showLockMessageFor, setShowLockMessageFor] = useState<number | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScroll = useRef(true); // Start true to prevent mount snap overriding activeLevel
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleLevelChange = (newLevel: number) => {
    setActiveLevel(newLevel);
    setModalLevel(newLevel);
    const storageKey = suggestionType === 'speak' ? `last_speak_level_${lessonId}` : suggestionType === 'alphabet' ? `last_alphabet_level_${lessonId}` : `last_level_${lessonId}`;
    localStorage.setItem(storageKey, newLevel.toString());
  };

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const centerLevel = (l: number, behavior: ScrollBehavior = 'smooth') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const btn = container.querySelector(`[data-level="${l}"]`) as HTMLElement;
    if (btn) {
      isProgrammaticScroll.current = true;
      const scrollLeft = btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior });
      
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        isProgrammaticScroll.current = false;
      }, behavior === 'smooth' ? 500 : 150);
    }
  };

  // Auto-scroll on mount
  useEffect(() => {
    isProgrammaticScroll.current = true;
    setTimeout(() => centerLevel(activeLevel, 'smooth'), 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isProgrammaticScroll.current) return;

    const container = e.currentTarget;
    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    
    let closestLevel = activeLevel;
    let minDistance = Infinity;

    const items = container.querySelectorAll('.level-scroll-item');
    items.forEach(item => {
      const childEl = item as HTMLElement;
      const childCenter = childEl.offsetLeft + childEl.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestLevel = parseInt(item.getAttribute('data-level') || '0', 10);
      }
    });

    if (closestLevel !== activeLevel) {
      if (levelStates[closestLevel]?.isUnlocked) {
         handleLevelChange(closestLevel);
         setShowLockMessageFor(null);
      } else if (closestLevel === firstLockedIndex) {
         setShowLockMessageFor(closestLevel);
      }
    }
  };

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

  const isLevelUnlocked = (l: number) => levelStates[l]?.isUnlocked || false;

  const isLevelCompleted = (l: number) => {
    if (l < 4) {
      return isPartCompleted(l, 0);
    } else {
      return currentFullLevels.includes(l);
    }
  };

  const totalLevels = maxLevel + 1;
  const completedCount = nodes.filter(l => isLevelUnlocked(l) && isLevelCompleted(l)).length;
  const progressPercent = totalLevels > 0 ? (completedCount / totalLevels) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col items-center justify-evenly w-full pt-4 pb-0">
      {/* Level Selector */}
      <div className="w-full flex flex-col items-center lg:items-center gap-3 px-4 content-start pt-6">
        {suggestionType === 'learn' && (
          <h3 className={`text-xl md:text-2xl font-extrabold text-center px-2 leading-tight w-full transition-colors duration-300 ${activeLevel >= 10 ? 'text-amber-500' : 'text-slate-700'}`}>
            {activeLevel < 10
              ? (getTranslation(`levelTitle.${activeLevel + 1}`, language) || `Niveau ${activeLevel + 1}`)
              : (getTranslation(`levelTitle.11`, language) || `Niveau Ultime`)
            }
          </h3>
        )}

        {/* Progress bar */}
        <div className="w-full max-w-md flex items-center gap-3 px-1">
          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700 ease-out rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-500 tabular-nums whitespace-nowrap">
            {completedCount}/{totalLevels}
          </span>
        </div>

        {/* Level Buttons Container with horizontal scroll on mobile */}
        <div className="w-full relative">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="relative w-full overflow-x-auto overflow-y-visible pt-8 pb-24 px-[calc(50vw-32px)] sm:px-[calc(50%-32px)] -mt-3 -mb-16"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              scrollSnapType: 'x mandatory',
              WebkitOverflowScrolling: 'touch'
            } as React.CSSProperties}
          >
            <style>{`
              div::-webkit-scrollbar { display: none; }
            `}</style>
            <div className="flex items-center justify-start gap-2 md:gap-2.5 min-w-max">
              {nodes.map((l) => {
                const unlocked = isLevelUnlocked(l);
                const isNextLocked = l === firstLockedIndex;
                const completed = unlocked && isLevelCompleted(l);
                const stars = earnedStarsArray[l] || 0;

                // Ne pas afficher les niveaux qui sont au-delà du prochain niveau à débloquer
                if (!unlocked && !isNextLocked) return null;

                const isAfterPhase1 = l === 4;
                const isAfterPhase2 = l === 9;

                const blockingReason = levelStates[l]?.blockingReason;
                const currentVisualLevel = nextLevel !== null ? nextLevel : activeLevel;
                const isSelected = currentVisualLevel === l;
                const label = l === maxLevel && maxLevel > 4
                  ? (getTranslation('auto.ultimate', language) || 'Ultime')
                  : `${l + 1}`;

                let sizeClasses = "min-w-[58px] min-h-[58px] md:min-w-[64px] md:min-h-[64px]";
                if (label === 'Ultime') {
                  sizeClasses = "min-w-[80px] min-h-[58px] md:min-w-[90px] md:min-h-[64px]";
                }

                let buttonClass = `${sizeClasses} px-3 rounded-2xl font-extrabold text-base md:text-lg transition-all duration-300 ease-out `;

                if (isSelected) {
                  buttonClass += `${unitColor} text-white shadow-2xl scale-110 z-10 ring-[3px] ring-white `;
                } else if (!unlocked && isNextLocked) {
                  buttonClass += "bg-slate-50 text-slate-400 border-2 border-dashed border-slate-300 cursor-help hover:bg-slate-100 ";
                } else if (completed) {
                  buttonClass += "bg-emerald-50 text-emerald-700 border-2 border-emerald-300 hover:border-emerald-400 hover:scale-105 shadow-sm ";
                } else {
                  buttonClass += "bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:scale-105 shadow-sm ";
                }

                return (
                  <React.Fragment key={l}>
                    {/* Phase separator */}
                    {isAfterPhase1 && (
                      <div className="flex flex-col items-center justify-center px-1 select-none" aria-hidden>
                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-slate-300 to-transparent" />
                      </div>
                    )}
                    {isAfterPhase2 && (
                      <div className="flex flex-col items-center justify-center px-1 select-none" aria-hidden>
                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-amber-400 to-transparent" />
                      </div>
                    )}

                    <div className="relative flex flex-col items-center level-scroll-item" data-level={l} style={{ scrollSnapAlign: 'center' }}>
                      {/* Active indicator dot above selected level */}
                      {isSelected && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                          <div className="w-2 h-2 rounded-full bg-slate-700 animate-bounce" />
                        </div>
                      )}

                      <button
                        data-level={l}
                        onClick={() => {
                          if (unlocked) {
                            handleLevelChange(l);
                            setShowLockMessageFor(null);
                            centerLevel(l, 'smooth');
                          } else if (isNextLocked) {
                            setShowLockMessageFor(l);
                            centerLevel(l, 'smooth');
                            setTimeout(() => setShowLockMessageFor(null), 3000);
                          }
                        }}
                        className={buttonClass}
                        aria-label={`Niveau ${label}${!unlocked ? ' (verrouillé)' : ''}`}
                        aria-pressed={isSelected}
                      >
                        <span className="relative z-10">{label}</span>

                        {/* Completed checkmark badge */}
                        {completed && !isSelected && (
                          <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md ring-2 ring-white z-20">
                            <Check className="w-3 h-3" strokeWidth={3.5} />
                          </span>
                        )}

                        {/* Lock badge for next locked level */}
                        {isNextLocked && (
                          <>
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 z-10">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-5 w-5 bg-slate-500 ring-2 ring-white items-center justify-center">
                                <Lock className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </span>
                            </span>
                          </>
                        )}
                      </button>

                      {/* Stars below completed level (only for non-selected) */}
                      {completed && stars > 0 && !isSelected && (
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-0.5 bg-white px-1.5 py-0.5 rounded-full shadow-md border border-slate-100 z-10">
                          {[1, 2, 3].map(i => (
                            <Star
                              key={i}
                              className={`w-2.5 h-2.5 ${i <= stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`}
                            />
                          ))}
                        </div>
                      )}

                      {/* Lock Message Tooltip */}
                      {showLockMessageFor === l && isNextLocked && (
                        <div className="absolute top-full mt-4 w-max max-w-[220px] bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-50 text-center animate-in fade-in zoom-in-95 left-1/2 -translate-x-1/2">
                          {blockingReason || (getTranslation('auto.level_locked', language) || "Niveau verrouillé.")}
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Edge gradients to indicate horizontal scrollability on mobile */}
          <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none md:hidden" />
          <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none md:hidden" />
        </div>
      </div>

      {/* Selected Level Node */}
      <div className={`w-full flex-1 relative mt-6 flex flex-col items-center justify-center transition-all duration-200 ease-out ${isFadingOut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <LessonPathNode
          key={`level-node-${activeLevel}`}
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
