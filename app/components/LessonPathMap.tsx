import React, { useEffect, useRef, useState } from 'react';
import { Star, Lock, Crown, Flag } from 'lucide-react';
import { getTranslation } from '../hooks/useTranslation';
import { getLevelSplit } from '../lib/levelSplits';

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
  suggestionType
}: LessonPathMapProps) {
  const nodes = Array.from({ length: maxLevel + 1 }).map((_, i) => i).reverse();

  const getOffset = (index: number) => {
    // Desktop alternating pattern for wide sweeping curves
    return index % 2 === 0 ? -120 : 120;
  };

  const getMobileOffset = (index: number) => {
    // Zigzag pattern mobile to leave space for images
    return index % 2 === 0 ? -70 : 70;
  };

  const getImageNameForLevel = (index: number) => {
    switch (index) {
      case 0: return 'find-the-good-traduction-removebg-preview.png';
      case 1: return 'complete-the-sentence.png';
      case 2: return 'build-your-sentence-removebg.png';
      case 3: return 'build-your-sentence-removebg.png';
      case 4: return 'niveau-5-nobg.png';
      case 5: return 'level-6-nobg.png';
      default: return null;
    }
  };

  const currentLevelRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeMobileLevel, setActiveMobileLevel] = useState<number | null>(null);

  useEffect(() => {
    if (currentLevelRef.current) {
      // Small delay to ensure modal/drawer is fully open before scrolling
      setTimeout(() => {
        currentLevelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-level-index'));
            if (!isNaN(idx)) {
              setActiveMobileLevel(idx);
            }
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    const validRefs = nodeRefs.current.filter(Boolean);
    validRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      validRefs.forEach((ref) => {
        if (ref) observer.unobserve(ref);
      });
    };
  }, [nodes.length]);

  const isUnlockedMastery = currentProgress >= maxLevel;
  const earnedStarsMastery = earnedStarsArray[maxLevel] || 0;

  return (
    <div className="flex flex-col items-center justify-start w-full relative py-8 overflow-x-hidden">
      {nodes.map((levelIndex) => {
        const isMastery = levelIndex === maxLevel;
        const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
        const isCompleted = isMastery ? earnedStarsMastery > 0 : levelIndex < currentProgress;
        const isCurrent = !isMastery && levelIndex === currentProgress;
        const isSelected = modalLevel === levelIndex;
        const earnedStars = earnedStarsArray[levelIndex] || 0;
        
        const totalSteps = lesson ? getLevelSplit(levelIndex, lesson) : 1;
        const partsKey = `${lessonId}_level-${levelIndex}`;
        const completedSteps = isCompleted ? totalSteps : (lessonPartsCompleted?.[partsKey]?.length || 0);

        const offset = getOffset(levelIndex);
        const labelSide = offset < 0 ? 'right' : offset > 0 ? 'left' : (levelIndex % 2 === 0 ? 'right' : 'left');

        const strokeClass = levelIndex <= currentProgress 
             ? unitColor.replace('bg-', 'text-') 
             : 'text-slate-200';

        return (
          <div key={levelIndex} className="relative w-full h-[240px] flex items-center justify-center">
            {/* Connection Line to the node below */}
            {levelIndex > 0 && (
              <>
                {/* Desktop SVG */}
                <svg className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] h-[240px] overflow-visible z-0 pointer-events-none">
                  <path
                    d={`M ${100 + getOffset(levelIndex)} 0 C ${100 + getOffset(levelIndex) * 1.5} 80, ${100 + getOffset(levelIndex - 1) * 1.5} 160, ${100 + getOffset(levelIndex - 1)} 240`}
                    fill="none"
                    stroke="currentColor"
                    className={strokeClass}
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  {/* Inner track for depth */}
                  <path
                    d={`M ${100 + getOffset(levelIndex)} 0 C ${100 + getOffset(levelIndex) * 1.5} 80, ${100 + getOffset(levelIndex - 1) * 1.5} 160, ${100 + getOffset(levelIndex - 1)} 240`}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Mobile SVG */}
                <svg className="block lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] h-[240px] overflow-visible z-0 pointer-events-none">
                  <path
                    d={`M ${100 + getMobileOffset(levelIndex)} 0 C ${100 + getMobileOffset(levelIndex) * 1.5} 80, ${100 + getMobileOffset(levelIndex - 1) * 1.5} 160, ${100 + getMobileOffset(levelIndex - 1)} 240`}
                    fill="none"
                    stroke="currentColor"
                    className={strokeClass}
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  {/* Inner track for depth */}
                  <path
                    d={`M ${100 + getMobileOffset(levelIndex)} 0 C ${100 + getMobileOffset(levelIndex) * 1.5} 80, ${100 + getMobileOffset(levelIndex - 1) * 1.5} 160, ${100 + getMobileOffset(levelIndex - 1)} 240`}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
              </>
            )}

            {/* Node */}
            <div 
              className="relative z-10 flex flex-col items-center justify-center transition-transform [transform:translateX(var(--offset-mobile))] lg:[transform:translateX(var(--offset-desktop))]"
              style={{ 
                '--offset-mobile': `${getMobileOffset(levelIndex)}px`,
                '--offset-desktop': `${getOffset(levelIndex)}px`
              } as React.CSSProperties}
              ref={(el) => {
                nodeRefs.current[levelIndex] = el;
                if (isCurrent && currentLevelRef) {
                  (currentLevelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }
              }}
              data-level-index={levelIndex}
            >
              {/* Objective Images */}
              {getImageNameForLevel(levelIndex) && suggestionType === 'learn' && (
                <>
                  {/* Desktop Image (pointing INWARDS to avoid overflow) */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-56 xl:w-64 z-0 transition-all duration-500 ease-out 
                    ${modalLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
                    ${getOffset(levelIndex) < 0 ? 'left-full ml-12' : 'right-full mr-12'}
                    ${modalLevel !== levelIndex && getOffset(levelIndex) < 0 ? '-translate-x-8' : ''}
                    ${modalLevel !== levelIndex && getOffset(levelIndex) > 0 ? 'translate-x-8' : ''}
                  `}>
                    <img src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`} alt="Objectif du niveau" className="w-full h-auto drop-shadow-2xl" />
                  </div>

                  {/* Mobile Image */}
                  {isAccessible && (
                    <div className={`block lg:hidden absolute top-1/2 -translate-y-1/2 w-44 z-0 transition-all duration-500 ease-out 
                      ${activeMobileLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
                      ${getMobileOffset(levelIndex) < 0 ? 'left-full ml-6' : 'right-full mr-6'}
                      ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) < 0 ? '-translate-x-4' : ''}
                      ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) > 0 ? 'translate-x-4' : ''}
                    `}>
                      <img src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`} alt="Objectif du niveau" className="w-full h-auto drop-shadow-xl" />
                    </div>
                  )}
                </>
              )}

              {isCurrent && isSelected && (
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
                      <div 
                        key={i} 
                        className="absolute left-1/2 top-1/2"
                        style={{ transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
                      >
                         <Star size={22} className={earned ? "fill-amber-400 stroke-amber-500 stroke-[1.5] drop-shadow-sm" : "fill-white stroke-slate-300 stroke-[1.5] drop-shadow-sm"} />
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Steps Indicator */}
              {(!isMastery && isAccessible && totalSteps > 0) && (
                <>
                  {/* Desktop Step Indicator */}
                  <div className={`hidden lg:flex absolute top-1/2 -translate-y-1/2 ${getOffset(levelIndex) < 0 ? 'left-[calc(100%+16px)]' : getOffset(levelIndex) > 0 ? 'right-[calc(100%+16px)]' : (levelIndex % 2 === 0 ? 'left-[calc(100%+16px)]' : 'right-[calc(100%+16px)]')} items-center justify-center bg-white px-3 py-2 rounded-2xl shadow-md border-2 border-slate-100 gap-2 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-20 whitespace-nowrap`}>
                    <Flag size={16} className={unitColor.replace('bg-', 'text-')} />
                    <span className="text-sm font-black text-slate-700">{completedSteps}/{totalSteps}</span>
                  </div>
                  {/* Mobile Step Indicator */}
                  <div className={`flex lg:hidden absolute -bottom-4 left-1/2 -translate-x-1/2 items-center justify-center bg-white px-2.5 py-1 rounded-xl shadow-md border-2 border-slate-100 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'} z-30 whitespace-nowrap`}>
                    <Flag size={14} className={unitColor.replace('bg-', 'text-')} />
                    <span className="text-[11px] font-black text-slate-700">{completedSteps}/{totalSteps}</span>
                  </div>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAccessible) {
                    setModalLevel(levelIndex);
                  }
                }}
                disabled={!isAccessible}
                className={`
                  w-[96px] h-[96px] rounded-full flex items-center justify-center transition-all duration-300 relative group
                  ${isSelected ? `scale-110 ring-[4px] ring-offset-[3px] shadow-xl z-20 ${unitColor.replace('bg-', 'ring-')}` : 'hover:scale-[1.05] z-10'}
                  ${isMastery
                    ? (isUnlockedMastery 
                        ? `bg-gradient-to-br from-amber-300 to-amber-500 border-b-[8px] border-amber-600 shadow-md text-white` 
                        : `bg-slate-100 border-b-[8px] border-slate-200 text-slate-300 shadow-sm`)
                    : (isCompleted
                        ? `${unitColor} border-b-[8px] ${unitBorder} shadow-sm text-white`
                        : isCurrent
                          ? `bg-white border-[6px] border-b-[10px] ${unitColor.replace('bg-', 'border-')} shadow-md ${unitText}`
                          : `bg-slate-100 border-b-[8px] border-slate-200 text-slate-300 shadow-sm`)
                  }
                `}
              >
                {/* Node Inner Icon / Number */}
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
      })}
    </div>
  );
}
