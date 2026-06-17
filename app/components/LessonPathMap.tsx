import React, { useEffect, useRef } from 'react';
import { Star, Lock, Crown } from 'lucide-react';
import { getTranslation } from '../hooks/useTranslation';

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
  language
}: LessonPathMapProps) {
  const nodes = Array.from({ length: maxLevel + 1 }).map((_, i) => i).reverse();

  const getOffset = (index: number) => {
    // Winding path pattern
    const pattern = [0, 45, 65, 45, 0, -45, -65, -45, 0, 45, 0];
    return pattern[index] || 0;
  };

  const currentLevelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLevelRef.current) {
      // Small delay to ensure modal/drawer is fully open before scrolling
      setTimeout(() => {
        currentLevelRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 300);
    }
  }, []);

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

        const strokeClass = levelIndex <= currentProgress 
             ? unitColor.replace('bg-', 'text-') 
             : 'text-slate-200';

        return (
          <div key={levelIndex} className="relative w-full h-[120px] flex items-center justify-center">
            {/* Connection Line to the node below */}
            {levelIndex > 0 && (
              <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[200px] h-[120px] overflow-visible z-0 pointer-events-none">
                <path
                  d={`M ${100 + getOffset(levelIndex)} 0 C ${100 + getOffset(levelIndex)} 60, ${100 + getOffset(levelIndex - 1)} 60, ${100 + getOffset(levelIndex - 1)} 120`}
                  fill="none"
                  stroke="currentColor"
                  className={strokeClass}
                  strokeWidth="18"
                  strokeLinecap="round"
                />
                {/* Inner track for depth */}
                <path
                  d={`M ${100 + getOffset(levelIndex)} 0 C ${100 + getOffset(levelIndex)} 60, ${100 + getOffset(levelIndex - 1)} 60, ${100 + getOffset(levelIndex - 1)} 120`}
                  fill="none"
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            )}

            {/* Node */}
            <div 
              className="relative z-10 flex flex-col items-center"
              style={{ transform: `translateX(${getOffset(levelIndex)}px)` }}
              ref={isCurrent ? currentLevelRef : null}
            >
              {isCurrent && isSelected && (
                <div className={`absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl font-bold text-xs text-white ${unitColor} whitespace-nowrap shadow-md animate-bounce`}>
                  {getTranslation('auto.in_progress', language)}
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 ${unitColor}`} />
                </div>
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
                  w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all duration-300 relative group
                  ${isSelected ? `scale-110 ring-[4px] ring-offset-[3px] shadow-xl z-20 ${unitColor.replace('bg-', 'ring-')}` : 'hover:scale-[1.05] z-10'}
                  ${isMastery
                    ? (isUnlockedMastery 
                        ? `bg-gradient-to-br from-amber-300 to-amber-500 border-b-[6px] border-amber-600 shadow-md text-white` 
                        : `bg-slate-100 border-b-[6px] border-slate-200 text-slate-300 shadow-sm`)
                    : (isCompleted
                        ? `${unitColor} border-b-[6px] ${unitBorder} shadow-sm text-white`
                        : isCurrent
                          ? `bg-white border-[4px] border-b-[8px] ${unitColor.replace('bg-', 'border-')} shadow-md ${unitText}`
                          : `bg-slate-100 border-b-[6px] border-slate-200 text-slate-300 shadow-sm`)
                  }
                `}
              >
                {/* Node Inner Icon / Number */}
                {isMastery ? (
                   <Crown size={32} className="fill-current stroke-[2] drop-shadow-sm" />
                ) : isCompleted ? (
                   <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="drop-shadow-sm"><polyline points="20 6 9 17 4 12"></polyline></svg>
                ) : isCurrent ? (
                   <span className={`font-black text-3xl drop-shadow-sm ${unitText}`}>{levelIndex + 1}</span>
                ) : (
                   <Lock size={28} className="stroke-[2.5]" />
                )}
              </button>

              {/* Stats Pill below node */}
              {(isAccessible && !isMastery) && (
                <div className={`absolute -bottom-5 flex items-center justify-center bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-200 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
                  <Star size={12} className="fill-amber-400 stroke-amber-500 stroke-[1.5]" />
                  <span className="text-[11px] font-black text-slate-600">{earnedStars}/10</span>
                </div>
              )}
              {isMastery && isAccessible && (
                <div className={`absolute -bottom-5 flex items-center justify-center bg-white px-2.5 py-1 rounded-full shadow-md border border-slate-200 gap-1.5 transition-opacity ${isSelected ? 'opacity-100' : 'opacity-90'}`}>
                  <Crown size={12} className="fill-amber-400 stroke-amber-500 stroke-[1.5]" />
                  <span className="text-[11px] font-black text-slate-600">{earnedStarsMastery}/5</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
