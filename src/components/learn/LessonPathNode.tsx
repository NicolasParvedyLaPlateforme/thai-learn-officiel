import React, { useState, useEffect, useRef } from 'react';
import { Star, Lock, Crown, Flag, CheckCircle2 } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";
import { getLevelSplit } from "@/lib/levelSplits";
import { PartNodeBubble } from './PartNodeBubble';
import { useProgressStore } from "@/lib/store";
import stepsMetadataLearn from "@/data/steps_metadata_learn.json";
import stepsMetadataAlphabet from "@/data/steps_metadata_alphabet.json";
import stepsMetadataSpeak from "@/data/steps_metadata_speak.json";

interface LessonPathNodeProps {
  levelIndex: number;
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
  targetScrollLevel: number;
  activeMobileLevel: number | null;
  nodeRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  currentLevelRef: React.MutableRefObject<HTMLDivElement | null>;
  getImageNameForLevel: (index: number) => string | null;
  getMobileOffset: (index: number) => number;
  getOffset: (index: number) => number;
  generatePath: (index: number, isMobile: boolean) => string;
  /** Height of this slot's div (px) */
  slotHeight: number;
  blockedByLevel?: number | null;
  isReminderTarget?: boolean;
  currentFullLevels?: number[];
}

export function LessonPathNode({
  levelIndex,
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
  targetScrollLevel,
  activeMobileLevel,
  nodeRefs,
  currentLevelRef,
  getImageNameForLevel,
  getMobileOffset,
  getOffset,
  generatePath,
  slotHeight,
  blockedByLevel,
  isReminderTarget,
  currentFullLevels,
}: LessonPathNodeProps) {
  const [selectedAction, setSelectedAction] = useState<number | 'full' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAction === null) return;
    const handler = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedAction(null);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [selectedAction]);

  // ── Current node state ──
  const isBlockedByFullLevel = blockedByLevel !== undefined && blockedByLevel !== null && levelIndex >= blockedByLevel;
  const isMastery = levelIndex === maxLevel;
  const isUnlockedMastery = currentProgress >= maxLevel;

  const isAccessible = (isMastery ? isUnlockedMastery : levelIndex <= currentProgress) && !isBlockedByFullLevel;

  const isCompletedFullLevel = currentFullLevels ? currentFullLevels.includes(levelIndex) : false;

  const earnedStarsMastery = (isCompletedFullLevel && levelIndex === maxLevel) ? (earnedStarsArray[maxLevel] || 0) : 0;
  const isCompleted = isMastery ? earnedStarsMastery > 0 : isCompletedFullLevel;
  const isCurrent = !isMastery && levelIndex === currentProgress && !isBlockedByFullLevel;
  const isSelected = selectedAction !== null;
  const earnedStars = isCompletedFullLevel ? (earnedStarsArray[levelIndex] || 0) : 0;

  // Step counter uses parts of the CURRENT level (for the flag indicator)
  const currentLevelParts = lesson ? getLevelSplit(levelIndex, lesson) : 1;
  const partsKey = `${lessonId}_level-${levelIndex}`;
  const completedPartsForFlag = lessonPartsCompleted?.[partsKey] || [];
  const completedStepsCount = isCompleted ? currentLevelParts : completedPartsForFlag.length;

  const strokeClass = levelIndex <= currentProgress
    ? unitColor.replace('bg-', 'text-')
    : 'text-slate-200';

  const currentPartsTotal = lesson ? getLevelSplit(levelIndex, lesson) : 1;
  const currentPartsKey = `${lessonId}_level-${levelIndex}`;
  const currentCompletedParts = lessonPartsCompleted?.[currentPartsKey] || [];

  const getStepsData = () => {
    if (suggestionType === 'alphabet') return stepsMetadataAlphabet;
    if (suggestionType === 'speak') return stepsMetadataSpeak;
    return stepsMetadataLearn;
  };

  const { getExpectedXp } = useProgressStore.getState();
  const lessonIdForXp = suggestionType === 'speak' ? `speak_${lessonId}` : suggestionType === 'alphabet' ? `alphabet_${lessonId}` : lessonId;
  const isBilanLesson = lesson?.isReview || lesson?.id?.startsWith('bilan-') || lesson?.id?.includes('-bilan') || lesson?.title?.toLowerCase().includes('bilan');

  const getExpectedXpForPart = (partIdx: number | 'full') => {
    const isPlayingPart = partIdx !== 'full' && currentPartsTotal > 1;
    const { xp } = getExpectedXp(
      lessonIdForXp || '',
      levelIndex,
      !!isBilanLesson,
      isPlayingPart,
      !isPlayingPart && (levelIndex === 7 || levelIndex === 8),
      partIdx === 'full' ? 0 : partIdx
    );
    return xp;
  };

  const getStepsForPart = (partIdx: number | 'full') => {
    const stepsData = getStepsData();
    const key = partIdx === 'full' ? 'full' : `part_${partIdx}`;
    return (stepsData as any)?.[lessonId || '']?.[levelIndex]?.[key] || 0;
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-[94%] md:w-[98%] max-w-6xl mx-auto flex items-center justify-center transition-colors duration-500 pt-5 pb-5`}
      id={`path-level-${lessonId}-${levelIndex}`}
    >
      {/* ── SVG connection lines have been removed per user request ── */}

      {/* ── Main node ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center pb-16 md:pb-24 w-full"
        ref={(el) => {
          nodeRefs.current[levelIndex] = el;
          const shouldScrollTo = modalLevel !== null ? isSelected : levelIndex === targetScrollLevel;
          if (shouldScrollTo && currentLevelRef) {
            currentLevelRef.current = el;
          }
        }}
        data-level-index={levelIndex}
      >
        {/* Halo background removed per user request, moved to container */}



        {/* Steps Indicator (flag) was here, removed because PartNodeBubble already displays it */}

        <div className="flex flex-row items-center justify-center gap-6">
          {/* Vertical Stars Column (Left of Camembert) */}
          {(isCompleted && !isMastery) && (
            <div className="flex flex-col justify-center gap-1.5 z-30">
              {[...Array(5)].map((_, i) => {
                const earned = earnedStars >= i + 1;
                return (
                  <Star key={i} size={24} className={earned ? "fill-amber-400 stroke-amber-500 stroke-[1.5] drop-shadow-sm" : "fill-slate-100 stroke-slate-300 stroke-[1.5] drop-shadow-sm"} />
                );
              })}
            </div>
          )}

          <div className="relative">
            {(!isMastery && currentPartsTotal > 1) ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (isAccessible) {
                if (isCompleted || currentCompletedParts.length === currentPartsTotal) {
                  setSelectedAction('full');
                } else {
                  setSelectedAction(currentCompletedParts.length);
                }
                e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }}
            className={`relative w-36 h-36 md:w-48 md:h-48 transition-all duration-300 group
              ${isAccessible ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-80'}
              ${isSelected ? 'scale-110' : ''}
            `}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl overflow-visible">
              {Array.from({ length: currentPartsTotal }).map((_, i) => {
                const isLevelFullyCompleted = isCompleted;
                const isLevelLocked = !isAccessible;

                const isPartCompleted = currentCompletedParts.includes(i);

                let isVerticalMet = true;
                if (levelIndex > 0) {
                  const prevPartsKey = `${lessonId}_level-${levelIndex - 1}`;
                  const prevCompletedParts = lessonPartsCompleted?.[prevPartsKey] || [];
                  const prevLevelPartsTotal = lesson ? getLevelSplit(levelIndex - 1, lesson) : 1;
                  const requiredPrevPart = Math.min(i, prevLevelPartsTotal - 1);
                  isVerticalMet = prevCompletedParts.includes(requiredPrevPart);
                }
                
                const isHorizontalMet = i === 0 || currentCompletedParts.includes(i - 1);
                const isAccessibleSlice = !isLevelLocked && isHorizontalMet && isVerticalMet;
                const isSelectedPart = !isLevelFullyCompleted && isAccessibleSlice && !isPartCompleted && (i === currentCompletedParts.length);

                const angle = 360 / currentPartsTotal;
                const startAngle = i * angle - 90;
                const endAngle = (i + 1) * angle - 90;

                const x1 = 50 + 48 * Math.cos(Math.PI * startAngle / 180);
                const y1 = 50 + 48 * Math.sin(Math.PI * startAngle / 180);
                const x2 = 50 + 48 * Math.cos(Math.PI * endAngle / 180);
                const y2 = 50 + 48 * Math.sin(Math.PI * endAngle / 180);
                const largeArc = angle > 180 ? 1 : 0;

                const pathData = `M 50 50 L ${x1} ${y1} A 48 48 0 ${largeArc} 1 ${x2} ${y2} Z`;

                const midAngle = startAngle + angle / 2;
                const textR = 30;
                const tx = 50 + textR * Math.cos(Math.PI * midAngle / 180);
                const ty = 50 + textR * Math.sin(Math.PI * midAngle / 180);

                const isCurrentlySelected = selectedAction === i;
                const isFullSelected = selectedAction === 'full';

                let colorClass = "fill-slate-100";
                let textClass = "fill-slate-400";

                if (isCurrentlySelected) {
                  colorClass = `${unitText} fill-current`;
                  textClass = "fill-white";
                } else if (isFullSelected) {
                  colorClass = `${unitText} fill-current opacity-40`;
                  textClass = "fill-white opacity-90";
                } else {
                  if (isPartCompleted) {
                    textClass = "fill-slate-300";
                  }
                }

                return (
                  <g
                    key={i}
                    className={`transition-all duration-300 ${!isLevelLocked && (isSelectedPart || isPartCompleted || isLevelFullyCompleted || isAccessibleSlice) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-25'}`}
                    style={isCurrentlySelected ? { transform: `scale(1.05)`, transformOrigin: '50px 50px' } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isLevelLocked && (isSelectedPart || isPartCompleted || isLevelFullyCompleted || isAccessibleSlice)) {
                        setSelectedAction(i);
                      }
                    }}
                  >
                    <path d={pathData} className={`${colorClass} stroke-white stroke-[3] transition-colors duration-300`} />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="central" className={`text-[8px] font-black transition-colors duration-300 ${textClass}`}>
                      P{i + 1}
                    </text>
                  </g>
                );
              })}

              <circle cx="50" cy="50" r="18"
                className={`${selectedAction === 'full' ? `${unitText} fill-current ring-2 ${unitColor.replace('bg-', 'ring-')}` : 'fill-slate-100'} ${blockedByLevel !== null && blockedByLevel !== undefined && levelIndex === blockedByLevel - 4 ? 'stroke-orange-500 animate-pulse stroke-[4]' : 'stroke-white stroke-[3]'} transition-colors ${isAccessible && isCompleted ? 'cursor-pointer hover:opacity-90' : 'pointer-events-none'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAccessible && isCompleted) setSelectedAction('full');
                }}
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                className={`text-[6.5px] font-black pointer-events-none transition-colors ${selectedAction === 'full' ? 'fill-white' : (isCompleted ? 'fill-slate-300' : 'fill-slate-400')}`}>
                ENTIER
              </text>
            </svg>

            {/* Tooltip La Suite */}
            {!isCompleted && isAccessible && isCurrent && (() => {
              const nextPart = currentCompletedParts.length;
              let isVerticalMet = true;
              if (levelIndex > 0) {
                const prevPartsKey = `${lessonId}_level-${levelIndex - 1}`;
                const prevCompletedParts = lessonPartsCompleted?.[prevPartsKey] || [];
                const prevLevelPartsTotal = lesson ? getLevelSplit(levelIndex - 1, lesson) : 1;
                const requiredPrevPart = Math.min(nextPart, prevLevelPartsTotal - 1);
                isVerticalMet = prevCompletedParts.includes(requiredPrevPart);
              }
              if (!isVerticalMet) return null;

              let tx = 50;
              let ty = 50;
              let midAngle = -90;

              const angle = 360 / currentPartsTotal;
              const startAngle = nextPart * angle - 90;
              midAngle = startAngle + angle / 2;
              const tooltipR = 64;
              tx = 50 + tooltipR * Math.cos(Math.PI * midAngle / 180);
              ty = 50 + tooltipR * Math.sin(Math.PI * midAngle / 180);

              const theta = (midAngle + 180) * Math.PI / 180;
              const cx = Math.cos(theta);
              const cy = Math.sin(theta);
              const scale = Math.min(28 / Math.max(Math.abs(cx), 0.001), 10 / Math.max(Math.abs(cy), 0.001));
              const ptrX = cx * (scale + 2);
              const ptrY = cy * (scale + 2);

              return (
                <div
                  className="absolute z-[100] pointer-events-none drop-shadow-md"
                  style={{
                    left: `${tx}%`,
                    top: `${ty}%`
                  }}
                >
                  <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
                    <div className="animate-bounce flex items-center justify-center relative">
                      <div
                        className="absolute w-2.5 h-2.5 bg-[#10B981] rounded-[1px]"
                        style={{
                          transform: `translate(${ptrX}px, ${ptrY}px) rotate(45deg)`
                        }}
                      />
                      <div className="relative z-10 bg-[#10B981] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider whitespace-nowrap shadow-sm">
                        La Suite
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tooltip Blocage */}
            {blockedByLevel !== null && blockedByLevel !== undefined && levelIndex === blockedByLevel - 4 && (() => {
              return (
                <div className="absolute z-[1000] pointer-events-none drop-shadow-md" style={{ left: '50%', top: '50%' }}>
                  {/* Changement du translate : on descend la bulle (40%) au lieu de la monter (-180%) */}
                  <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, 40%)' }}>
                    {/* L'animation bounce a été retirée ici */}
                    <div className="flex flex-col items-center justify-center relative">

                      {/* La flèche est maintenant placée AU-DESSUS du texte et pointe vers le haut */}
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-indigo-500 mb-[-1px]"></div>

                      {/* Le corps de la bulle */}
                      <div className="relative z-1000 bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg text-center shadow-md max-w-[140px]">
                        Le niveau {blockedByLevel + 1} est débloqué qu'après l'accomplissement du niveau {blockedByLevel - 3} en entier
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Tooltip Reminder */}
            {isReminderTarget && levelIndex === targetScrollLevel && (() => {
              return (
                <div className="absolute z-[100] pointer-events-none drop-shadow-md" style={{ left: '50%', top: '50%' }}>
                  <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -220%)' }}>
                    <div className="animate-bounce flex flex-col items-center justify-center relative">
                      <div className="relative z-10 bg-amber-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg text-center shadow-md max-w-[120px] whitespace-pre-wrap leading-tight">
                        Petit rappel ?
                        <br /><span className="text-amber-100 font-black">+50 XP bonus</span>
                      </div>
                      <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-amber-500 mt-[-1px]"></div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (isAccessible) {
                setSelectedAction('full');
                e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
              }
            }}
            disabled={!isAccessible}
            className={[
              'w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center transition-all duration-300 relative group',
              isSelected
                ? `scale-110 ring-[4px] ring-offset-[3px] shadow-xl z-20 ${unitColor.replace('bg-', 'ring-')}`
                : 'hover:scale-[1.05] z-10',
              isMastery
                ? (isUnlockedMastery
                  ? 'bg-gradient-to-br from-amber-300 to-amber-500 border-b-[8px] border-amber-600 shadow-md text-white'
                  : 'bg-slate-100 border-b-[8px] border-slate-200 text-slate-300 shadow-sm')
                : (isCompleted
                  ? `${unitColor} border-b-[8px] ${unitBorder} shadow-sm text-white`
                  : isCurrent
                    ? `bg-white border-[6px] border-b-[10px] ${unitColor.replace('bg-', 'border-')} shadow-md ${unitText}`
                    : 'bg-slate-100 border-b-[8px] border-slate-200 text-slate-300 shadow-sm'),
            ].join(' ')}
          >
            {isMastery ? (
              <Crown size={44} className="fill-current stroke-[2] drop-shadow-sm" />
            ) : isCompleted ? (
              <span className="font-black text-4xl drop-shadow-sm text-white">{levelIndex + 1}</span>
            ) : isCurrent ? (
              <span className={`font-black text-4xl drop-shadow-sm ${unitText}`}>{levelIndex + 1}</span>
            ) : (
              <Lock size={36} className="stroke-[2.5]" />
            )}
          </button>
        )}

        {/* Tooltip Blocage for non-part nodes (mastery, etc) */}
        {currentPartsTotal <= 1 && blockedByLevel !== null && blockedByLevel !== undefined && levelIndex === blockedByLevel - 4 && (
          <div className="absolute z-[1000] pointer-events-none drop-shadow-md mt-5" style={{ left: '50%', top: '50%' }}>
            {/* Changement du translate : on descend la bulle (40%) au lieu de la monter (-180%) */}
            <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, 40%)' }}>
              {/* L'animation bounce a été retirée ici */}
              <div className="flex flex-col items-center justify-center relative">

                {/* La flèche est maintenant placée AU-DESSUS du texte et pointe vers le haut */}
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-transparent border-b-indigo-500 mb-[-1px]"></div>

                {/* Le corps de la bulle */}
                <div className="relative z-1000 bg-indigo-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg text-center shadow-md max-w-[140px]">
                  Le niveau {blockedByLevel + 1} est débloqué qu'après l'accomplissement du niveau {blockedByLevel - 3} en entier
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tooltip Reminder for non-part nodes */}
        {currentPartsTotal <= 1 && isReminderTarget && levelIndex === targetScrollLevel && (
          <div className="absolute z-[100] pointer-events-none drop-shadow-md" style={{ left: '50%', top: '50%' }}>
            <div className="relative flex items-center justify-center" style={{ transform: 'translate(-50%, -200%)' }}>
              <div className="animate-bounce flex flex-col items-center justify-center relative">
                <div className="relative z-10 bg-amber-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg text-center shadow-md max-w-[120px] whitespace-pre-wrap leading-tight">
                  Petit rappel ?
                  <br /><span className="text-amber-100 font-black">+50 XP bonus</span>
                </div>
                <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-amber-500 mt-[-1px]"></div>
              </div>
            </div>
          </div>
        )}

        {isMastery && isAccessible && (
          <div className={`absolute -bottom-6 flex items-center justify-center bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-20`}>
            <Crown size={14} className="fill-amber-400 stroke-amber-500 stroke-[1.5]" />
            <span className="text-xs font-black text-slate-600">{earnedStarsMastery}/5</span>
          </div>
        )}
          </div>
        </div>

        {selectedAction !== null && (
          <div className="w-full mt-4 md:mt-8 flex justify-center z-40">
            <PartNodeBubble
              lessonId={lessonId || ''}
              levelIndex={levelIndex}
              partIndex={selectedAction}
              totalParts={currentPartsTotal}
              stepsCount={getStepsForPart(selectedAction)}
              expectedXp={getExpectedXpForPart(selectedAction)}
              isCompleted={selectedAction === 'full' ? isCompleted : currentCompletedParts.includes(selectedAction)}
              unitColor={unitColor}
              unitText={unitText}
              nodeX={getOffset(levelIndex)}
              onClose={() => setSelectedAction(null)}
              suggestionType={suggestionType}
            />
          </div>
        )}
      </div>
    </div>
  );
}
