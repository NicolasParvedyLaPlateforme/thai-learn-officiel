import React from 'react';

interface PathTimelineLineProps {
  level: number;
  maxLevel: number;
  colorClass: string;
  isDesktop?: boolean;
}

export default function PathTimelineLine({ level, maxLevel, colorClass, isDesktop = false }: PathTimelineLineProps) {
  const progress = Math.min(1, Math.max(0, level / maxLevel));
  const strokeWidth = isDesktop ? 10 : 8;
  const containerClasses = isDesktop 
    ? 'absolute top-1/2 left-1/2 w-[24px] -translate-x-1/2 h-[calc(100%+6rem)] -z-10'
    : 'absolute top-1/2 left-[1.25rem] sm:left-[1.5rem] w-[20px] -translate-x-1/2 h-[calc(100%+3.5rem)] -z-10';

  const colorText = colorClass.replace('bg-', 'text-');

  return (
    <div className={containerClasses}>
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className="text-slate-200" />
        <line x1="50%" y1="0" x2="50%" y2={`${progress * 100}%`} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" className={`${colorText} transition-all duration-1000 ease-out`} />
      </svg>
    </div>
  );
}
