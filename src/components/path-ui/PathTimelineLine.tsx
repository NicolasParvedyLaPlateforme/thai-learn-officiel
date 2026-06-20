import React from 'react';

interface PathTimelineLineProps {
  level: number;
  maxLevel: number;
  colorClass: string;
  isDesktop?: boolean;
}

export default function PathTimelineLine({ level, maxLevel, colorClass, isDesktop = false }: PathTimelineLineProps) {
  const progress = Math.min(1, Math.max(0, level / maxLevel));
  
  // Overshoot the height slightly to ensure it seamlessly connects behind the next circle.
  // Mobile uses mb-6 or mb-8 (~1.5rem to 2rem). We use calc(100% + 3.5rem) to overshoot.
  // Desktop uses mb-16 (~4rem). We use calc(100% + 6rem) to overshoot.
  const containerClasses = isDesktop 
    ? 'absolute top-1/2 left-1/2 w-[10px] -translate-x-1/2 h-[calc(100%+6rem)] bg-slate-200 -z-10 rounded-full overflow-hidden opacity-80'
    : 'absolute top-1/2 left-[1.25rem] sm:left-[1.5rem] w-2 -translate-x-1/2 h-[calc(100%+3.5rem)] bg-slate-200 -z-10 rounded-full overflow-hidden opacity-80';

  return (
    <div className={containerClasses}>
      <div 
        className={`w-full ${colorClass} transition-all duration-1000 ease-out`}
        style={{ height: `${progress * 100}%` }}
      />
    </div>
  );
}
