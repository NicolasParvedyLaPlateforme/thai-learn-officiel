import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, Crown } from 'lucide-react';

interface LessonPathMobileNavProps {
  nodes: number[];
  maxLevel: number;
  currentProgress: number;
  activeMobileLevel: number | null;
  setActiveMobileLevel: (lvl: number) => void;
  unitColor: string;
  isUnlockedMastery: boolean;
  menuVisible: boolean;
  carouselRef: React.RefObject<HTMLDivElement | null>;
  isClickScrolling: React.MutableRefObject<boolean>;
  scrollEndTimer: React.MutableRefObject<NodeJS.Timeout | null>;
  onBack?: () => void;
}

export function LessonPathMobileNav({
  nodes,
  maxLevel,
  currentProgress,
  activeMobileLevel,
  setActiveMobileLevel,
  unitColor,
  isUnlockedMastery,
  menuVisible,
  carouselRef,
  isClickScrolling,
  scrollEndTimer,
  onBack
}: LessonPathMobileNavProps) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div 
      className={`flex lg:hidden fixed bottom-6 left-4 right-4 h-[72px] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-[2.5rem] z-[60] items-center px-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] pointer-events-auto transition-all duration-500 ease-out ${menuVisible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}
    >
       {onBack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBack();
            }}
            className={`shrink-0 w-[46px] h-[46px] rounded-[16px] flex items-center justify-center shadow-sm ${unitColor} text-white mx-1`}
          >
            <ChevronLeft size={24} strokeWidth={2.5} className="mr-0.5" />
          </button>
       )}

       {onBack && <div className="w-[2px] h-8 bg-slate-100 mx-2 rounded-full shrink-0" />}

       <div 
         ref={carouselRef as any}
         className="flex-1 overflow-x-auto flex items-center gap-3 px-2 h-full snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
       >
          {[...nodes].reverse().map((levelIndex) => {
            const isMastery = levelIndex === maxLevel;
            const isAccessible = isMastery ? isUnlockedMastery : levelIndex <= currentProgress;
            const isActive = (activeMobileLevel === levelIndex) || (activeMobileLevel === null && levelIndex === currentProgress);

            return (
              <button
                key={`nav-mobile-${levelIndex}`}
                data-nav-level={levelIndex}
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAccessible) {
                    isClickScrolling.current = true;
                    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
                    scrollEndTimer.current = setTimeout(() => {
                      isClickScrolling.current = false;
                    }, 800);

                    // 1. Center the carousel button instantly
                    const button = carouselRef.current?.querySelector(`[data-nav-level="${levelIndex}"]`) as HTMLElement;
                    if (carouselRef.current && button) {
                      const container = carouselRef.current;
                      const containerRect = container.getBoundingClientRect();
                      const buttonRect = button.getBoundingClientRect();
                      const scrollLeft = container.scrollLeft + (buttonRect.left - containerRect.left) - (containerRect.width / 2) + (buttonRect.width / 2);
                      container.scrollTo({ left: scrollLeft, behavior: 'auto' });
                    }

                    setActiveMobileLevel(levelIndex);
                    
                    // 2. Smoothly scroll the page immediately
                    const targetNode = document.getElementById(`path-level-${levelIndex}`);
                    if (targetNode) {
                      targetNode.scrollIntoView({ block: 'center', behavior: 'smooth' });
                    }
                  }
                }}
                disabled={!isAccessible}
                className={`
                  shrink-0 relative z-10 w-[42px] h-[42px] rounded-full flex items-center justify-center transition-all duration-300 snap-center font-bold text-[15px]
                  ${!isAccessible ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400' 
                    : isActive ? `${unitColor} text-white scale-[1.15] shadow-lg shadow-black/10` 
                    : `bg-slate-100 text-slate-600 hover:bg-slate-200`
                  }
                `}
              >
                {isMastery ? <Crown size={18} className={isActive ? "fill-current" : "fill-slate-400"} /> : <span>{levelIndex + 1}</span>}
              </button>
            );
          })}
       </div>
    </div>,
    document.body
  );
}
