import React from 'react';
import { cn } from "@/lib/utils";

interface SegmentedProgressBorderProps {
  maxLevel: number;
  currentLevel: number;
  colorClass: string;
  radius?: number;
}

export function SegmentedProgressBorder({ maxLevel, currentLevel, colorClass, radius = 32 }: SegmentedProgressBorderProps) {
  const gap = 1.5; // 1.5% of perimeter
  const dashLength = (100 / maxLevel) - gap;

  const getColoredDashArray = (completed: number) => {
    if (completed === 0) return `0 1000`;
    let arr = [];
    for (let i = 0; i < completed; i++) {
      arr.push(dashLength);
      arr.push(gap);
    }
    arr.push(0);
    arr.push(1000);
    return arr.join(' ');
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-50" style={{ borderRadius: 'inherit' }}>
      <rect
        x="2.5" y="2.5" width="calc(100% - 5px)" height="calc(100% - 5px)"
        rx={radius}
        fill="none"
        stroke="#e2e8f0"
        strokeWidth="5"
        pathLength="100"
        strokeDasharray={`${dashLength} ${gap}`}
      />
      <rect
        x="2.5" y="2.5" width="calc(100% - 5px)" height="calc(100% - 5px)"
        rx={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        pathLength="100"
        strokeDasharray={getColoredDashArray(currentLevel)}
        className={colorClass}
        strokeLinecap="round"
      />
    </svg>
  );
}
