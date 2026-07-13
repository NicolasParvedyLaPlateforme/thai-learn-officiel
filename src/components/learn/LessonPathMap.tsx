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
    // i is 0-indexed. i = 0 is Niveau 1. i = 4 is Niveau 5. i = 10 is Ultime.
    const l = i + 1; // 1-indexed

    let isUnlocked = false;
    let currentBlockingReason: string | null = null;

    if (i < 4) {
      // Phase 1 : Niveaux 1 à 4
      isUnlocked = (i === 0) || isPartCompleted(i - 1, 0);
      if (!isUnlocked) {
        currentBlockingReason = `${getTranslation('auto.complete_part_1_of_level', language) || 'Terminez la partie 1 du Niveau '}${l - 1}${getTranslation('auto.to_unlock', language) || ' pour débloquer.'}`;
      }
    } else if (i < 10) {
      // Phase 2+3 : Niveaux 5 à 10
      const requiredFullLevelIndex = i - 4; // Pour i=4 (Niv 5), il faut fullLevel 0 (Niv 1)
      const isFullMet = currentFullLevels.includes(requiredFullLevelIndex);
      const isPartsMet = healedProgress >= i; // healedProgress == lessonLevel. Pour i=4, il faut lessonLevel >= 4.

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
      // Ultime (i = 10)
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

  // Séquence 1 : Recherche horizontale dans Niveaux 1 à 4
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

  // Séquence 2+3 : Full Levels et Parties 5 à 10
  if (!foundTarget) {
      for (let i = 0; i <= 5; i++) {
       const fullLevelIndex = i;
       const partsLevelIndex = i + 4;
       
       if (healedProgress >= fullLevelIndex) {
           if (!currentFullLevels.includes(fullLevelIndex)) {
              calculatedTarget = fullLevelIndex; // focus on the level associated with this full level
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

  // Séquence 4 : Ultime
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
      
      // If the saved level is fully completed, it's better to jump to the next uncompleted level
      if (isFullyCompleted && calculatedTarget > initialScrollLevel) {
          validInitialScroll = calculatedTarget;
      }
  }

  const targetScrollLevel = validInitialScroll !== undefined && validInitialScroll !== null ? validInitialScroll : calculatedTarget;
  
  const [activeLevel, setActiveLevel] = useState<number>(targetScrollLevel);
  const [nextLevel, setNextLevel] = useState<number | null>(null);
  const [isFadingOut, setIsFadingOut] = useState<boolean>(false);
  const [showLockMessageFor, setShowLockMessageFor] = useState<number | null>(null);

  const handleLevelChange = (newLevel: number) => {
    setActiveLevel(newLevel);
    setModalLevel(newLevel);
    const storageKey = suggestionType === 'speak' ? `last_speak_level_${lessonId}` : suggestionType === 'alphabet' ? `last_alphabet_level_${lessonId}` : `last_level_${lessonId}`;
    localStorage.setItem(storageKey, newLevel.toString());
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

  const isLevelUnlocked = (l: number) => levelStates[l]?.isUnlocked || false;

  return (
    <div className="flex-1 flex flex-col items-center justify-evenly w-full pt-4 pb-0">
      {/* Level Selector */}
      <div className="w-full flex flex-col items-center lg:items-center gap-4 px-4 content-start pt-6">
        {suggestionType === 'learn' && (
          <h3 className={`text-xl md:text-2xl font-extrabold text-center px-2 leading-tight w-full ${activeLevel >= 10 ? 'text-amber-500' : 'text-slate-700'}`}>
            {activeLevel < 10 
              ? (getTranslation(`levelTitle.${activeLevel + 1}`, language) || `Niveau ${activeLevel + 1}`) 
              : (getTranslation(`levelTitle.11`, language) || `Niveau Ultime`)
            }
          </h3>
        )}
        <div className="flex flex-wrap justify-center gap-3 w-full">
        {nodes.map((l) => {
          const unlocked = isLevelUnlocked(l);
          const isNextLocked = l === firstLockedIndex;
          
          // Ne pas afficher les niveaux qui sont au-delà du prochain niveau à débloquer
          if (!unlocked && !isNextLocked) return null;
          
          const blockingReason = levelStates[l]?.blockingReason;

          const currentVisualLevel = nextLevel !== null ? nextLevel : activeLevel;
          const isSelected = currentVisualLevel === l;
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
              {showLockMessageFor === l && isNextLocked && (() => {
                const isRightEdge = l === 3 || l === 4 || l === 8 || l === 9 || l >= maxLevel - 1;
                const isLeftEdge = l === 0 || l === 5;
                
                return (
                <div className={`absolute top-full mt-3 w-max max-w-[220px] bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-50 text-center animate-in fade-in zoom-in-95
                  ${isRightEdge ? 'right-0 md:left-1/2 md:-translate-x-1/2' : (isLeftEdge ? 'left-0 md:left-1/2 md:-translate-x-1/2' : 'left-1/2 -translate-x-1/2')}
                `}>
                  {blockingReason || (getTranslation('auto.level_locked', language) || "Niveau verrouillé.")}
                  <div className={`absolute -top-1 w-2 h-2 bg-slate-800 rotate-45
                    ${isRightEdge ? 'right-6 md:left-1/2 md:-translate-x-1/2 md:right-auto' : (isLeftEdge ? 'left-6 md:left-1/2 md:-translate-x-1/2 md:left-auto' : 'left-1/2 -translate-x-1/2')}
                  `}></div>
                </div>
                );
              })()}
            </div>
          );
        })}
        </div>
      </div>

      {/* Selected Level Node */}
      <div className={`w-full flex-1 relative mt-4 flex flex-col items-center justify-center transition-all duration-200 ease-out ${isFadingOut ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
        <LessonPathNode
          key={`level-node-${activeLevel}`}
          levelIndex={activeLevel}
          maxLevel={maxLevel}
          currentProgress={effectiveProgress} // Note: effectiveProgress recalculates using logic that doesn't need healing, so we can leave it as is. Wait, effectiveProgress uses firstLockedIndex which uses healedProgress! So it's already healed.
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
