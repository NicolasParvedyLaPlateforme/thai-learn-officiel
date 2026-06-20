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
  const strokeWidth = isDesktop ? 10 : 8;
  const containerClasses = isDesktop 
    ? 'absolute top-1/2 left-1/2 w-[24px] -translate-x-1/2 h-[calc(100%+6rem)] -z-10'
    : 'absolute top-1/2 left-[1.25rem] sm:left-[1.5rem] w-[20px] -translate-x-1/2 h-[calc(100%+3.5rem)] -z-10';

  const colorText = colorClass.replace('bg-', 'text-');

  return (
    <div className={containerClasses}>
      <svg className="absolute inset-0 w-full h-full overflow-visible" preserveAspectRatio="none">
        {/* Background dotted line */}
        <line 
          x1="50%" y1="0" 
          x2="50%" y2="100%" 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          strokeDasharray="0 24" 
          strokeLinecap="round" 
          className="text-slate-200" 
        />
        {/* Active dotted line */}
        <line 
          x1="50%" y1="0" 
          x2="50%" y2={`${progress * 100}%`} 
          stroke="currentColor" 
          strokeWidth={strokeWidth} 
          strokeDasharray="0 24" 
          strokeLinecap="round" 
          className={`${colorText} transition-all duration-1000 ease-out`} 
        />
      </svg>
    </div>
  );
}
