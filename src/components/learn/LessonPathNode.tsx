import React, { useState, useEffect, useRef } from 'react';
import { Star, Lock, Crown, Flag, CheckCircle2 } from 'lucide-react';
import { getTranslation } from "@/hooks/useTranslation";
import { getLevelSplit } from "@/lib/levelSplits";
import { PartNodeBubble } from './PartNodeBubble';
import stepsMetadata from "@/data/steps_metadata_learn.json";
import { PartSubNode } from './PartSubNode';

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
  const [openPartBubble, setOpenPartBubble] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (openPartBubble === null) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenPartBubble(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openPartBubble]);

  // ── Current node state ──
  const isMastery = levelIndex === maxLevel;
  const isUnlockedMastery = currentProgress >= maxLevel;
  const earnedStarsMastery = earnedStarsArray[maxLevel] || 0;
  const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
  const isCompleted = isMastery ? earnedStarsMastery > 0 : levelIndex < currentProgress;
  const isCurrent = !isMastery && levelIndex === currentProgress;
  const isSelected = modalLevel === levelIndex;
  const earnedStars = earnedStarsArray[levelIndex] || 0;

  // Step counter uses parts of the CURRENT level (for the flag indicator)
  const currentLevelParts = lesson ? getLevelSplit(levelIndex, lesson) : 1;
  const partsKey = `${lessonId}_level-${levelIndex}`;
  const completedPartsForFlag = lessonPartsCompleted?.[partsKey] || [];
  const completedStepsCount = isCompleted ? currentLevelParts : completedPartsForFlag.length;

  const strokeClass = levelIndex <= currentProgress
    ? unitColor.replace('bg-', 'text-')
    : 'text-slate-200';

  // ── Part sub-nodes: parts of (levelIndex - 1) drawn in this slot's path ──
  //
  // Layout: nodes rendered top→bottom as [maxLevel, ..., 1, 0].
  // The path in slot(levelIndex) connects levelIndex (top) → levelIndex-1 (bottom).
  // To progress FROM levelIndex-1 TO levelIndex, the user must complete parts of levelIndex-1.
  // So we display parts of levelIndex-1 along the path inside slot(levelIndex).
  //
  // P1 goes near levelIndex-1 (bottom of path), P(n) near levelIndex (top of path).
  // t=0 → top of path (levelIndex's node), t=1 → bottom (levelIndex-1's node).
  // P1 (i=0): t ≈ 0.75 (near bottom = near levelIndex-1).
  // P(n) (i=n-1): t ≈ 0.25 (near top = near levelIndex).

  const prevLevelIndex = levelIndex - 1;
  const currentPartsTotal = lesson ? getLevelSplit(levelIndex, lesson) : 1;
  const currentPartsKey = `${lessonId}_level-${levelIndex}`;
  const currentCompletedParts = lessonPartsCompleted?.[currentPartsKey] || [];
  
  // A part is accessible if the previous level is fully completed.
  // Wait, if levelIndex === 0, prev level doesn't exist, so it's always accessible.
  const isPartAccessible = levelIndex === 0 ? true : levelIndex <= currentProgress;
  
  // showPartNodes: display parts of levelIndex in this slot's path.
  // Don't show parts for the mastery node itself, unless it has parts (usually it doesn't).
  const showPartNodes = !isMastery && lessonId != null && currentPartsTotal > 1;

  // Distribute parts evenly from bottom (t=0) to top (t=1). 
  // P1 is at highest t (closest to 1), P(n) is at lowest t (closest to 0).
  const partTValues = showPartNodes
    ? Array.from({ length: currentPartsTotal }, (_, i) => {
        // Equal spacing between t=1 (top) and t=0 (bottom)
        return 1 - ((i + 1) / (currentPartsTotal + 1));
      })
    : [];

  /**
   * Evaluate the linear path at t and return the CSS transform offset
   * from the slot center to place the part node.
   *
   * t=0 is this node (y=0), t=1 is prev node (y=-pathHeight).
   */
  const evalLinearXY = (t: number, isMobile: boolean): { x: number; y: number } => {
    const height = pathHeight;
    const startX = isMobile ? getMobileOffset(levelIndex) : getOffset(levelIndex);
    const endX = isMobile ? getMobileOffset(prevLevelIndex) : getOffset(prevLevelIndex);
    const x = startX + t * (endX - startX);
    const y = -height * t;
    return { x, y };
  };

  const getStepsForPart = (partIdx: number): number => {
    return (stepsMetadata as any)?.[lessonId || '']?.[levelIndex]?.[`part_${partIdx}`] || 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ height: `${slotHeight}px` }}
      id={`path-level-${levelIndex}`}
    >
      {/* ── SVG connection lines have been removed per user request ── */}

      {/* ── Part sub-nodes (P1, P2, P3…) placed along the path ── */}
      {showPartNodes && isPartAccessible && partTValues.map((t, partIdx) => {
        const isPartCompleted = currentCompletedParts.includes(partIdx);
        const isNextPart = !isCompleted && currentCompletedParts.length === partIdx;
        const canAccessPart = isCompleted || partIdx <= currentCompletedParts.length;

        const dXY = evalLinearXY(t, false); // desktop
        const mXY = evalLinearXY(t, true);  // mobile

        return (
          <React.Fragment key={`part-${levelIndex}-${partIdx}`}>
            {/* Desktop */}
            <PartSubNode
              isMobile={false}
              partIdx={partIdx}
              isPartAccessible={canAccessPart}
              isPartCompleted={isPartCompleted}
              isNextPart={isNextPart}
              positionX={dXY.x}
              positionY={dXY.y}
              unitColor={unitColor}
              unitBorder={unitBorder}
              unitText={unitText}
              lessonId={lessonId!}
              levelIndex={levelIndex}
              totalParts={currentPartsTotal}
              stepsCount={getStepsForPart(partIdx)}
              isOpen={openPartBubble === partIdx}
              onToggle={() => setOpenPartBubble(openPartBubble === partIdx ? null : partIdx)}
              onClose={() => setOpenPartBubble(null)}
            />

            {/* Mobile */}
            <PartSubNode
              isMobile={true}
              partIdx={partIdx}
              isPartAccessible={canAccessPart}
              isPartCompleted={isPartCompleted}
              isNextPart={isNextPart}
              positionX={mXY.x}
              positionY={mXY.y}
              unitColor={unitColor}
              unitBorder={unitBorder}
              unitText={unitText}
              lessonId={lessonId!}
              levelIndex={levelIndex}
              totalParts={currentPartsTotal}
              stepsCount={getStepsForPart(partIdx)}
              isOpen={openPartBubble === partIdx}
              onToggle={() => setOpenPartBubble(openPartBubble === partIdx ? null : partIdx)}
              onClose={() => setOpenPartBubble(null)}
            />
          </React.Fragment>
        );
      })}

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
            ${isAccessible ? 'opacity-100' : 'opacity-50 grayscale blur-[1px]'}
            ${getOffset(levelIndex) < 0 ? 'left-full ml-6 md:ml-12' : 'right-full mr-6 md:mr-12'}
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

        {isCurrent && (
          <div className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl font-bold text-xs text-white ${unitColor} whitespace-nowrap shadow-md animate-bounce z-40`}>
            {getTranslation('auto.in_progress', language)}
            <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 ${unitColor}`} />
          </div>
        )}

        {/* Stars Arc */}
        {(isCompleted && !isMastery) && (
          <div className="absolute top-1/2 left-1/2 w-full h-full pointer-events-none z-30" style={{ transform: 'translate(-50%, -50%)' }}>
            {[...Array(5)].map((_, i) => {
              const angleRad = ((-90 + (i - 2) * 35) * Math.PI) / 180;
              const radius = 72;
              const x = Math.cos(angleRad) * radius;
              const y = Math.sin(angleRad) * radius;
              const earned = earnedStars >= i + 1;
              return (
                <div key={i} className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
                  <Star size={22} className={earned ? "fill-amber-400 stroke-amber-500 stroke-[1.5] drop-shadow-sm" : "fill-white stroke-slate-300 stroke-[1.5] drop-shadow-sm"} />
                </div>
              );
            })}
          </div>
        )}

        {/* Steps Indicator (flag) */}
        {(!isMastery && isAccessible && currentLevelParts > 0) && (
          <>
            <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${getOffset(levelIndex) < 0 ? 'left-[calc(100%+16px)]' : 'right-[calc(100%+16px)]'} items-center justify-center bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-slate-100 gap-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-20 whitespace-nowrap`}>
              <Flag size={16} className={unitColor.replace('bg-', 'text-')} />
              <span className="text-sm font-black text-slate-700">{completedStepsCount}/{currentLevelParts}</span>
            </div>
            <div className={`flex lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 items-center justify-center bg-white px-2.5 py-1 rounded-xl shadow-md border-2 border-slate-100 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-30 whitespace-nowrap`}>
              <Flag size={14} className={unitColor.replace('bg-', 'text-')} />
              <span className="text-[11px] font-black text-slate-700">{completedStepsCount}/{currentLevelParts}</span>
            </div>
          </>
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenPartBubble(null);
            if (isAccessible) {
              setModalLevel(levelIndex);
              e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }
          }}
          disabled={!isAccessible}
          className={[
            'w-[96px] h-[96px] rounded-full flex items-center justify-center transition-all duration-300 relative group',
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

        {isMastery && isAccessible && (
          <div className={`absolute -bottom-6 flex items-center justify-center bg-white px-3 py-1.5 rounded-full shadow-md border border-slate-200 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-20`}>
            <Crown size={14} className="fill-amber-400 stroke-amber-500 stroke-[1.5]" />
            <span className="text-xs font-black text-slate-600">{earnedStarsMastery}/5</span>
          </div>
        )}
      </div>
    </div>
  );
}
