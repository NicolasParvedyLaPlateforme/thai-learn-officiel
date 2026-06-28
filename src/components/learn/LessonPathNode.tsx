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
  /** Actual center-to-center distance to previous node (for SVG path height) */
  pathHeight: number;
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
  pathHeight,
}: LessonPathNodeProps) {
  const [selectedAction, setSelectedAction] = useState<number | 'full' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedAction === null) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedAction(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedAction]);

  // ── Current node state ──
  const isMastery = levelIndex === maxLevel;
  const isUnlockedMastery = currentProgress >= maxLevel;
  const earnedStarsMastery = earnedStarsArray[maxLevel] || 0;
  const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
  const isCompleted = isMastery ? earnedStarsMastery > 0 : levelIndex < currentProgress;
  const isCurrent = !isMastery && levelIndex === currentProgress;
  const isSelected = selectedAction !== null;
  const earnedStars = earnedStarsArray[levelIndex] || 0;

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
      className={`relative w-[94%] md:w-[98%] max-w-6xl mx-auto flex items-center justify-center transition-colors duration-500 mb-10 mt-5 pt-5 pb-5 ${levelIndex === maxLevel
        ? 'h-[160px] md:h-[240px] mb-[80px]'
        : levelIndex === currentProgress
          ? 'h-[160px] md:h-[240px] mb-[160px]'
          : levelIndex === 0
            ? 'h-[160px] md:h-[240px] mb-[80px]'
            : 'h-[160px] md:h-[240px] mb-[80px]'
        } ${isCurrent ? `${unitColor.replace(/\d+/, '100')} rounded-2xl md:rounded-3xl` : ''}`}
      id={`path-level-${levelIndex}`}
    >
      {/* ── SVG connection lines have been removed per user request ── */}

      {/* ── Main node ── */}
      <div
        className="relative z-10 flex flex-col items-center justify-center transition-transform [transform:translateX(var(--offset-mobile))] lg:[transform:translateX(var(--offset-desktop))]"
        style={{
          '--offset-mobile': `${getMobileOffset(levelIndex)}px`,
          '--offset-desktop': `${getOffset(levelIndex)}px`,
        } as React.CSSProperties}
        ref={(el) => {
          nodeRefs.current[levelIndex] = el;
          const shouldScrollTo = modalLevel !== null ? isSelected : levelIndex === targetScrollLevel;
          if (shouldScrollTo && currentLevelRef) {
            currentLevelRef.current = el;
          }
        }}
        data-level-index={levelIndex}
      >
        {/* Objective Images */}
        {getImageNameForLevel(levelIndex) && suggestionType === 'learn' && (
          <div className={`absolute top-1/2 -translate-y-1/2 w-32 md:w-56 lg:w-72 z-0 transition-all duration-500 ease-out
            ${activeMobileLevel === levelIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
            ${getOffset(levelIndex) < 0 ? 'left-full ml-10 md:ml-20 lg:ml-28' : 'right-full mr-10 md:mr-20 lg:mr-28'}
          `}>
            <div className={`hidden md:block bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm mb-2 mx-auto w-max max-w-full border border-slate-100 font-bold text-slate-700 text-xs md:text-sm text-center transition-all duration-500`}>
              {getTranslation(`levelTitle.${levelIndex + 1}`, language)}
            </div>
            <img
              src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`}
              alt="Objectif du niveau"
              className="w-full h-auto drop-shadow-xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        {/* Halo background removed per user request, moved to container */}

        {/* Stars Arc */}
        {(isCompleted && !isMastery) && (
          <div className="absolute top-1/2 left-1/2 w-44 h-44 md:w-56 md:h-56 pointer-events-none z-30 -ml-4" style={{ transform: 'translate(-50%, -50%)' }}>
            {[...Array(5)].map((_, i) => {
              const angleDeg = -90 + (i - 2) * 35;
              const earned = earnedStars >= i + 1;
              return (
                <div key={i} className="absolute left-1/2 top-1/2 w-full h-full" style={{ transform: `translate(-50%, -50%) rotate(${angleDeg}deg)` }}>
                  <div className="absolute top-0 left-1/2" style={{ transform: `translate(-50%, -50%) rotate(${-angleDeg}deg)` }}>
                    <Star size={26} className={earned ? "fill-amber-400 stroke-amber-500 stroke-[1.5] drop-shadow-sm" : "fill-white stroke-slate-300 stroke-[1.5] drop-shadow-sm"} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Steps Indicator (flag) was here, removed because PartNodeBubble already displays it */}

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
                const isSelectedPart = !isLevelFullyCompleted && !isLevelLocked && i === currentCompletedParts.length;
                const isAccessibleSlice = !isLevelLocked && i <= currentCompletedParts.length;

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
                    className={`transition-all duration-300 ${(isSelectedPart || isPartCompleted || isLevelFullyCompleted || isAccessibleSlice) ? 'cursor-pointer hover:scale-105' : 'cursor-not-allowed opacity-25'}`}
                    style={isCurrentlySelected ? { transform: `scale(1.05)`, transformOrigin: '50px 50px' } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSelectedPart || isPartCompleted || isLevelFullyCompleted || isAccessibleSlice) {
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
                className={`${selectedAction === 'full' ? `${unitText} fill-current ring-2 ${unitColor.replace('bg-', 'ring-')}` : 'fill-slate-100'} stroke-white stroke-[3] transition-colors ${isCompleted ? 'cursor-pointer hover:opacity-90' : 'pointer-events-none'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isCompleted) setSelectedAction('full');
                }}
              />
              <text x="50" y="50" textAnchor="middle" dominantBaseline="central"
                className={`text-[6.5px] font-black pointer-events-none transition-colors ${selectedAction === 'full' ? 'fill-white' : (isCompleted ? 'fill-slate-300' : 'fill-slate-400')}`}>
                ENTIER
              </text>
            </svg>

            {/* Tooltip La Suite */}
            {!isCompleted && isAccessible && (() => {
              let tx = 50;
              let ty = 50;
              let midAngle = -90;

              const nextPart = currentCompletedParts.length;
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
                  className="absolute z-20 pointer-events-none drop-shadow-md"
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

        {isMastery && isAccessible && (
          <div className={`absolute -bottom-6 flex items-center justify-center bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-20`}>
            <Crown size={14} className="fill-amber-400 stroke-amber-500 stroke-[1.5]" />
            <span className="text-xs font-black text-slate-600">{earnedStarsMastery}/5</span>
          </div>
        )}

        {selectedAction !== null && (
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
        )}
      </div>
    </div>
  );
}
