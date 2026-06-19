import React, { useEffect, useRef, useState } from 'react';
import { Star, Lock, Crown, Flag, ChevronLeft } from 'lucide-react';
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
  onReady?: () => void;
  onBack?: () => void;
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
  onReady,
  onBack
}: LessonPathMapProps) {
  const nodes = Array.from({ length: maxLevel + 1 }).map((_, i) => i).reverse();

  const getOffset = (index: number) => {
    // Desktop alternating pattern for wide sweeping curves
    return index % 2 === 0 ? -120 : 120;
  };

  const getMobileOffset = (index: number) => {
    // Zigzag pattern mobile to leave space for images
    return index % 2 === 0 ? -95 : 95;
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

  const generatePath = (index: number, isMobile: boolean) => {
    const height = isMobile ? 240 : 320;
    const startX = 100 + (isMobile ? getMobileOffset(index) : getOffset(index));
    const endX = 100 + (isMobile ? getMobileOffset(index - 1) : getOffset(index - 1));
    
    // Strict S-curve matching the drawing: no outward bulge.
    const c1x = startX;
    const c2x = endX;
    
    // Cross the Y control points to force the path to drop vertically from the node,
    // make a quick horizontal sweep in the middle (where there are no images),
    // and then drop vertically into the next node.
    const c1y = height * 0.8;
    const c2y = height * 0.2;

    return `M ${startX} 0 C ${c1x} ${c1y}, ${c2x} ${c2y}, ${endX} ${height}`;
  };

  const currentLevelRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeMobileLevel, setActiveMobileLevel] = useState<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (activeMobileLevel !== null && carouselRef.current) {
      const button = carouselRef.current.querySelector(`[data-nav-level="${activeMobileLevel}"]`) as HTMLElement;
      if (button) {
        const container = carouselRef.current;
        const scrollLeft = button.offsetLeft - container.offsetLeft - (container.clientWidth / 2) + (button.clientWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      }
    }
  }, [activeMobileLevel]);

  useEffect(() => {
    if (currentLevelRef.current) {
      setTimeout(() => {
        currentLevelRef.current?.scrollIntoView({ block: 'center', behavior: 'auto' });
        // Fade in after jumping to the right position
        setTimeout(() => {
          setIsReady(true);
          onReady?.();
        }, 50);
      }, 10);
    } else {
      setIsReady(true);
      onReady?.();
    }
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const centerY = window.innerHeight / 2;
        let closestIndex: number | null = null;
        let minDistance = Infinity;

        nodeRefs.current.forEach((node, index) => {
          if (node) {
            const rect = node.getBoundingClientRect();
            const nodeCenterY = rect.top + rect.height / 2;
            const distance = Math.abs(nodeCenterY - centerY);
            if (distance < minDistance) {
              minDistance = distance;
              closestIndex = index;
            }
          }
        });

        if (closestIndex !== null && minDistance < window.innerHeight / 2) {
          setActiveMobileLevel(closestIndex);
        }
      }, 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Execute once to set initial active level based on current scroll
    setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeout);
    };
  }, []);

  const isUnlockedMastery = currentProgress >= maxLevel;
  const earnedStarsMastery = earnedStarsArray[maxLevel] || 0;

  return (
    <div className="flex flex-col items-center justify-start w-full relative pt-8 pb-[15vh] lg:pb-[30vh]">
      {/* Vertical Navigation Bar (Desktop Only) */}
      <div className="hidden lg:block absolute -left-16 xl:-left-24 top-0 bottom-0 z-50 pointer-events-none">
        <div className="sticky top-1/2 -translate-y-1/2 flex flex-col items-center py-4 pointer-events-auto">
          {/* Ligne centrale */}
          <div className={`absolute top-4 ${onBack ? 'bottom-[5.5rem]' : 'bottom-4'} w-[4px] bg-slate-200 rounded-full left-1/2 -translate-x-1/2 z-0`} />

          {nodes.map((levelIndex) => {
            const isMastery = levelIndex === maxLevel;
            const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
            const isCompleted = isMastery ? earnedStarsMastery > 0 : levelIndex < currentProgress;
            const isActive = (activeMobileLevel === levelIndex) || (activeMobileLevel === null && levelIndex === currentProgress);

            return (
              <button
                key={`nav-${levelIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAccessible) {
                    const targetNode = nodeRefs.current[levelIndex];
                    if (targetNode) {
                      targetNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                  }
                }}
                disabled={!isAccessible}
                className={`
                  relative z-10 w-8 h-8 rounded-full flex items-center justify-center my-1.5 transition-all duration-300 group
                  ${!isAccessible ? 'opacity-50 cursor-not-allowed bg-slate-200 border-2 border-slate-300 text-slate-400' 
                    : isActive ? `${unitColor} ring-[3px] ring-offset-2 ${unitColor.replace('bg-', 'ring-')} text-white scale-[1.25] shadow-md` 
                    : isCompleted ? `${unitColor} border-[3px] border-white shadow-sm text-white hover:scale-110`
                    : `bg-white border-[3px] ${unitColor.replace('bg-', 'border-')} ${unitText} hover:scale-110`
                  }
                `}
              >
                {isMastery ? <Crown size={14} className="fill-current w-4 h-4" /> : <span className={`text-xs font-black`}>{levelIndex + 1}</span>}
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                  {isMastery ? getTranslation('auto.mastery', language) : `Niv. ${levelIndex + 1}`}
                </div>
              </button>
            );
          })}

          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className={`relative z-10 w-10 h-10 rounded-[12px] flex items-center justify-center mt-6 transition-all duration-300 hover:scale-110 shadow-md ${unitColor} text-white group`}
            >
              <ChevronLeft size={22} strokeWidth={3} className="mr-0.5 w-[22px] h-[22px]" />
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg">
                {getTranslation('auto.back', language)}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Navigation Bar (Mobile Only) */}
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 h-[76px] bg-white border-t border-slate-200 z-[60] items-center px-2 shadow-[0_-4px_20px_-15px_rgba(0,0,0,0.1)] pointer-events-auto">
         {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className={`shrink-0 w-10 h-10 rounded-[12px] flex items-center justify-center shadow-md ${unitColor} text-white mx-2`}
            >
              <ChevronLeft size={22} strokeWidth={3} className="mr-0.5" />
            </button>
         )}

         {onBack && <div className="w-px h-8 bg-slate-200 mx-1 shrink-0" />}

         <div 
           ref={carouselRef}
           className="flex-1 overflow-x-auto flex items-center gap-4 px-4 h-full snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
         >
            {[...nodes].reverse().map((levelIndex) => {
              const isMastery = levelIndex === maxLevel;
              const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
              const isCompleted = isMastery ? earnedStarsMastery > 0 : levelIndex < currentProgress;
              const isActive = (activeMobileLevel === levelIndex) || (activeMobileLevel === null && levelIndex === currentProgress);

              return (
                <button
                  key={`nav-mobile-${levelIndex}`}
                  data-nav-level={levelIndex}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isAccessible) {
                      setActiveMobileLevel(levelIndex);
                      const targetNode = nodeRefs.current[levelIndex];
                      if (targetNode) {
                        targetNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
                      }
                    }
                  }}
                  disabled={!isAccessible}
                  className={`
                    shrink-0 relative z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 snap-center
                    ${!isAccessible ? 'opacity-50 cursor-not-allowed bg-slate-200 border-2 border-slate-300 text-slate-400' 
                      : isActive ? `${unitColor} ring-[4px] ring-offset-2 ${unitColor.replace('bg-', 'ring-')} text-white scale-[1.1] shadow-md` 
                      : isCompleted ? `${unitColor} border-[3px] border-white shadow-sm text-white`
                      : `bg-white border-[3px] ${unitColor.replace('bg-', 'border-')} ${unitText}`
                    }
                  `}
                >
                  {isMastery ? <Crown size={16} className="fill-current" /> : <span className={`text-sm font-black`}>{levelIndex + 1}</span>}
                </button>
              );
            })}
         </div>
      </div>

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
          <div key={levelIndex} className="relative w-full h-[240px] lg:h-[320px] flex items-center justify-center snap-center">
            {/* Connection Line to the node below */}
            {levelIndex > 0 && (
              <>
                {/* Desktop SVG */}
                <svg className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] h-[320px] overflow-visible z-0 pointer-events-none">
                  <path
                    d={generatePath(levelIndex, false)}
                    fill="none"
                    stroke="currentColor"
                    className={strokeClass}
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  {/* Inner track for depth */}
                  <path
                    d={generatePath(levelIndex, false)}
                    fill="none"
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                </svg>
                {/* Mobile SVG */}
                <svg className="block lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] h-[240px] overflow-visible z-0 pointer-events-none">
                  <path
                    d={generatePath(levelIndex, true)}
                    fill="none"
                    stroke="currentColor"
                    className={strokeClass}
                    strokeWidth="22"
                    strokeLinecap="round"
                  />
                  {/* Inner track for depth */}
                  <path
                    d={generatePath(levelIndex, true)}
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
                const shouldScrollTo = modalLevel !== null ? isSelected : isCurrent;
                if (shouldScrollTo && currentLevelRef) {
                  (currentLevelRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
                }
              }}
              data-level-index={levelIndex}
            >
              {/* Objective Images */}
              {getImageNameForLevel(levelIndex) && suggestionType === 'learn' && (
                <>
                  {/* Desktop Image (pointing INWARDS to avoid overflow) */}
                  <div className={`hidden lg:block absolute top-1/2 -translate-y-1/2 w-72 xl:w-80 z-0 transition-all duration-500 ease-out 
                    ${activeMobileLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
                    ${getOffset(levelIndex) < 0 ? 'left-full ml-32' : 'right-full mr-32'}
                    ${activeMobileLevel !== levelIndex && getOffset(levelIndex) < 0 ? '-translate-x-8' : ''}
                    ${activeMobileLevel !== levelIndex && getOffset(levelIndex) >= 0 ? 'translate-x-8' : ''}
                  `}>
                    <img 
                      src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`} 
                      alt="Objectif du niveau" 
                      className={`w-full h-auto drop-shadow-2xl rounded-3xl transition-all duration-500 ${!isAccessible ? 'grayscale-[0.8] opacity-60 blur-[1px]' : ''}`} 
                    />
                  </div>

                  {/* Mobile Image */}
                  <div className={`block lg:hidden absolute top-1/2 -translate-y-1/2 w-40 z-0 transition-all duration-500 ease-out 
                    ${activeMobileLevel === levelIndex ? 'opacity-100 translate-x-0' : 'opacity-0 pointer-events-none'}
                    ${getMobileOffset(levelIndex) < 0 ? 'left-full ml-12' : 'right-full mr-12'}
                    ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) < 0 ? '-translate-x-12' : ''}
                    ${activeMobileLevel !== levelIndex && getMobileOffset(levelIndex) > 0 ? 'translate-x-12' : ''}
                  `}>
                    <img 
                      src={`/images/image-learn-niveau/${getImageNameForLevel(levelIndex)}`} 
                      alt="Objectif du niveau" 
                      className={`w-full h-auto drop-shadow-xl transition-all duration-500 ${!isAccessible ? 'grayscale-[0.8] opacity-60 blur-[1px]' : ''}`} 
                    />
                  </div>
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
                    e.currentTarget.scrollIntoView({ block: 'center', behavior: 'smooth' });
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
