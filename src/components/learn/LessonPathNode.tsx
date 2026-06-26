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
  const prevPartsTotal = (lesson && levelIndex > 0) ? getLevelSplit(prevLevelIndex, lesson) : 1;
  const prevPartsKey = `${lessonId}_level-${prevLevelIndex}`;
  const prevCompletedParts = lessonPartsCompleted?.[prevPartsKey] || [];
  // prevLevel is accessible if we've at least started it
  const isPrevLevelAccessible = levelIndex > 0 && prevLevelIndex <= currentProgress;
  // prevLevel is fully done once we've reached levelIndex
  const isPrevLevelCompleted = levelIndex <= currentProgress;

  // showPartNodes: display parts of levelIndex-1 in this slot's path.
  // Allowed even on the mastery slot (shows parts of the last numbered level).
  const showPartNodes = levelIndex > 0 && lessonId != null && prevPartsTotal > 1;

  // Distribute parts evenly from bottom (t=0.8, P1) to top (t=0.2, P(n))
  const partTValues = showPartNodes
    ? Array.from({ length: prevPartsTotal }, (_, i) => {
      // t decreasing from 0.8 (P1, near levelIndex-1) to 0.2 (P(n), near levelIndex)
      return 0.8 - i * (0.6 / (prevPartsTotal - 1 || 1));
    })
    : [];

  /**
   * Evaluate the bezier path at t and return the CSS transform offset
   * from the slot center to place the part node.
   *
   * SVG: top-1/2 → y=0 is at this node's center. y=pathHeight is at prev node's center.
   * CSS transform from slot center: offsetY = bezierY (positive = downward).
   */
  const evalBezierXY = (t: number, isMobile: boolean): { x: number; y: number } => {
    const height = pathHeight; // use actual center-to-center distance
    const startX = 100 + (isMobile ? getMobileOffset(levelIndex) : getOffset(levelIndex));
    const endX = 100 + (isMobile ? getMobileOffset(prevLevelIndex) : getOffset(prevLevelIndex));
    const c1y = isMobile ? height * 0.8 : height * 0.5;
    const c2y = isMobile ? height * 0.2 : height * 0.5;
    const mt = 1 - t;
    const bx = mt * mt * mt * startX + 3 * mt * mt * t * startX + 3 * mt * t * t * endX + t * t * t * endX;
    const by = mt * mt * mt * 0 + 3 * mt * mt * t * c1y + 3 * mt * t * t * c2y + t * t * t * height;
    return { x: bx - 100, y: by };
  };

  const getStepsForPart = (partIdx: number): number => {
    return (stepsMetadata as any)?.[lessonId || '']?.[prevLevelIndex]?.[`part_${partIdx}`] || 0;
  };

  // Whether to suppress the thick bezier track (replaced by part circles + dashed line)
  const suppressTrack = showPartNodes;

  // SVG height = pathHeight (center-to-center distance), not slotHeight
  const svgH = pathHeight;

  return (
    <div
      ref={containerRef}
      className="relative w-full flex items-center justify-center"
      style={{ height: `${slotHeight}px` }}
      id={`path-level-${levelIndex}`}
    >
      {/* ── Connection Line (hidden when part circles replace it) ── */}
      {levelIndex > 0 && !suppressTrack && (
        <>
          {/* Desktop SVG */}
          <svg
            className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] overflow-visible z-0 pointer-events-none"
            style={{ height: `${svgH}px` }}
          >
            <path d={generatePath(levelIndex, false)} fill="none" stroke="currentColor"
              className={strokeClass} strokeWidth="22" strokeLinecap="round" />
            <path d={generatePath(levelIndex, false)} fill="none" stroke="rgba(255,255,255,0.2)"
              strokeWidth="8" strokeLinecap="round" />
          </svg>
          {/* Mobile SVG */}
          <svg
            className="block lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] overflow-visible z-0 pointer-events-none"
            style={{ height: `${svgH}px` }}
          >
            <path d={generatePath(levelIndex, true)} fill="none" stroke="currentColor"
              className={strokeClass} strokeWidth="22" strokeLinecap="round" />
            <path d={generatePath(levelIndex, true)} fill="none" stroke="rgba(255,255,255,0.2)"
              strokeWidth="8" strokeLinecap="round" />
          </svg>
        </>
      )}

      {/* ── Thin connector lines between part circles when track is hidden ── */}
      {suppressTrack && levelIndex > 0 && (
        <>
          {/* Desktop dashed connector */}
          <svg
            className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] overflow-visible z-0 pointer-events-none"
            style={{ height: `${svgH}px` }}
          >
            <path d={generatePath(levelIndex, false)} fill="none" stroke="currentColor"
              className={strokeClass} strokeWidth="8" strokeLinecap="round" strokeDasharray="6 6" opacity="0.35" />
          </svg>
          {/* Mobile dashed connector */}
          <svg
            className="block lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] overflow-visible z-0 pointer-events-none"
            style={{ height: `${svgH}px` }}
          >
            <path d={generatePath(levelIndex, true)} fill="none" stroke="currentColor"
              className={strokeClass} strokeWidth="8" strokeLinecap="round" strokeDasharray="6 6" opacity="0.35" />
          </svg>
        </>
      )}

      {/* ── Part sub-nodes (P1, P2, P3…) placed along the path ── */}
      {showPartNodes && isPrevLevelAccessible && partTValues.map((t, partIdx) => {
        const isPartCompleted = prevCompletedParts.includes(partIdx);
        const isNextPart = !isPrevLevelCompleted && prevCompletedParts.length === partIdx;
        const isPartAccessible = isPrevLevelCompleted || partIdx <= prevCompletedParts.length;

        const dXY = evalBezierXY(t, false); // desktop
        const mXY = evalBezierXY(t, true);  // mobile

        return (
          <React.Fragment key={`part-${levelIndex}-${partIdx}`}>
            {/* Desktop */}
            <PartSubNode
              isMobile={false}
              partIdx={partIdx}
              isPartAccessible={isPartAccessible}
              isPartCompleted={isPartCompleted}
              isNextPart={isNextPart}
              positionX={dXY.x}
              positionY={dXY.y}
              unitColor={unitColor}
              unitText={unitText}
              lessonId={lessonId!}
              levelIndex={prevLevelIndex}
              totalParts={prevPartsTotal}
              stepsCount={getStepsForPart(partIdx)}
              isOpen={openPartBubble === partIdx}
              onToggle={() => setOpenPartBubble(openPartBubble === partIdx ? null : partIdx)}
              onClose={() => setOpenPartBubble(null)}
            />

            {/* Mobile */}
            <PartSubNode
              isMobile={true}
              partIdx={partIdx}
              isPartAccessible={isPartAccessible}
              isPartCompleted={isPartCompleted}
              isNextPart={isNextPart}
              positionX={mXY.x}
              positionY={mXY.y}
              unitColor={unitColor}
              unitText={unitText}
              lessonId={lessonId!}
              levelIndex={prevLevelIndex}
              totalParts={prevPartsTotal}
              stepsCount={getStepsForPart(partIdx)}
              isOpen={openPartBubble === partIdx}
              onToggle={() => setOpenPartBubble(openPartBubble === partIdx ? null : partIdx)}
              onClose={() => setOpenPartBubble(null)}
            />

            {/* Mobile */}
            <div
              className="flex lg:hidden absolute left-1/2 top-1/2 z-20"
              style={{ transform: `translate(calc(-50% + ${mXY.x}px), calc(-50% + ${mXY.y}px))` }}
            >
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isPartAccessible) return;
                    setOpenPartBubble(openPartBubble === partIdx ? null : partIdx);
                  }}
                  disabled={!isPartAccessible}
                  title={`Partie ${partIdx + 1}`}
                  className={[
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                    'border-[3px] shadow-lg font-black text-[11px] tracking-wide',
                    !isPartAccessible
                      ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                      : isPartCompleted
                        ? `${unitColor} border-white text-white hover:scale-110 active:scale-95`
                        : isNextPart
                          ? `bg-white ${unitColor.replace('bg-', 'border-')} ${unitText} hover:scale-110 animate-pulse`
                          : 'bg-white border-slate-300 text-slate-400 hover:scale-105',
                    openPartBubble === partIdx
                      ? `scale-110 ring-2 ring-offset-2 ${unitColor.replace('bg-', 'ring-')}`
                      : '',
                  ].join(' ')}
                >
                  {isPartCompleted
                    ? <CheckCircle2 size={16} className="stroke-[2.5]" />
                    : <span>P{partIdx + 1}</span>
                  }
                </button>

                {openPartBubble === partIdx && isPartAccessible && (
                  <PartNodeBubble
                    lessonId={lessonId!}
                    levelIndex={prevLevelIndex}
                    partIndex={partIdx}
                    totalParts={prevPartsTotal}
                    stepsCount={getStepsForPart(partIdx)}
                    isCompleted={isPartCompleted}
                    unitColor={unitColor}
                    unitText={unitText}
                    nodeX={mXY.x}
                    onClose={() => setOpenPartBubble(null)}
                  />
                )}
              </div>
            </div>
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
          <>
            <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-72 xl:w-80 z-0 transition-all duration-500 ease-out 
              ${activeMobileLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
              ${getOffset(levelIndex) < 0 ? 'left-full ml-32' : 'right-full mr-32'}
              ${activeMobileLevel !== levelIndex && getOffset(levelIndex) < 0 ? '-translate-x-8' : ''}
              ${activeMobileLevel !== levelIndex && getOffset(levelIndex) >= 0 ? 'translate-x-8' : ''}
            `}>
              <div className={`bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm mb-3 mx-auto w-max max-w-full border border-slate-100 font-bold text-slate-700 text-sm md:text-base text-center transition-all duration-500 ${!isAccessible ? 'opacity-60' : ''}`}>
                {getTranslation(`levelTitle.${levelIndex + 1}`, language)}
              </div>
              <img
                src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`}
                alt="Objectif du niveau"
                className={`w-full h-auto drop-shadow-2xl rounded-3xl transition-all duration-500 ${!isAccessible ? 'grayscale-[0.8] opacity-60 blur-[1px]' : ''}`}
              />
            </div>

            <div className={`block lg:hidden absolute top-1/2 -translate-y-1/2 w-40 z-0 transition-all duration-500 ease-out 
              ${activeMobileLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
              ${getMobileOffset(levelIndex) < 0 ? 'left-full ml-12' : 'right-full mr-12'}
              ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) < 0 ? '-translate-x-12' : ''}
              ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) > 0 ? 'translate-x-12' : ''}
            `}>
              <div className={`bg-white/95 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm mb-2 mx-auto w-max max-w-full border border-slate-100 font-bold text-slate-700 text-[11px] text-center transition-all duration-500 ${!isAccessible ? 'opacity-60' : ''}`}>
                {getTranslation(`levelTitle.${levelIndex + 1}`, language)}
              </div>
              <img
                src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`}
                alt="Objectif du niveau"
                className={`w-full h-auto drop-shadow-xl transition-all duration-500 ${!isAccessible ? 'grayscale-[0.8] opacity-60 blur-[1px]' : ''}`}
              />
            </div>
          </>
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
