import React from 'react';

interface PathTimelineLineProps {
  level: number;
  maxLevel: number;
  colorClass: string;
  isDesktop?: boolean;
  isLeft?: boolean;
  isHorizontal?: boolean;
}

export default function PathTimelineLine({ level, maxLevel, colorClass, isDesktop = false, isLeft, isHorizontal = false }: PathTimelineLineProps) {
  const progress = Math.min(1, Math.max(0, level / maxLevel));
  const strokeWidth = isDesktop ? 10 : 8;
  
  let containerClasses = '';
  if (isHorizontal) {
    containerClasses = 'absolute top-1/2 left-1/2 w-[calc(100%-4rem)] -translate-x-1/2 -translate-y-1/2 h-[20px] -z-10';
  } else {
    containerClasses = isDesktop
      ? `absolute top-1/2 ${isLeft === true ? 'left-1/4' : isLeft === false ? 'left-3/4' : 'left-1/2'} w-[24px] -translate-x-1/2 h-full -z-10`
      : 'absolute top-3 left-[2rem] sm:left-[2em] w-[20px] -translate-x-1/2 h-[calc(60%+3.5rem)] -z-10';
  }

  const colorText = colorClass.replace('bg-', 'text-');

  return (
    <div className={containerClasses}>
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
        {isHorizontal ? (
          <>
            <line x1="0" y1="50%" x2="100%" y2="50%" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className="text-slate-200" />
            <line x1="0" y1="50%" x2={`${progress * 100}%`} y2="50%" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={`${colorText} transition-all duration-1000 ease-out`} />
          </>
        ) : (
          <>
            <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className="text-slate-200" />
            <line x1="50%" y1="0" x2="50%" y2={`${progress * 100}%`} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={`${colorText} transition-all duration-1000 ease-out`} />
          </>
        )}
      </svg>
    </div>
  );
}
