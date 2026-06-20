import React from 'react';

interface PathDecorationsProps {
  index: number;
  isDesktop?: boolean;
}

export function PathDecorations({ index, isDesktop = false }: PathDecorationsProps) {
  // Use index to deterministically place decorations so they don't randomly re-render
  // This gives a consistent organic feel to the path

  const seed = (index * 997) % 1000;
  const isRight = seed % 2 === 0;
  
  // Decide what to show based on seed
  const showLeaf = seed % 3 === 0;
  const showSparkle = seed % 4 === 0;
  const showCloud = seed % 5 === 0;

  if (!showLeaf && !showSparkle && !showCloud) return null;

  const horizontalOffset = isDesktop ? 60 + (seed % 60) : 30 + (seed % 30);
  const side = isRight ? `right-[-${horizontalOffset}px]` : `left-[-${horizontalOffset}px]`;
  const verticalPosition = `${20 + (seed % 60)}%`;
  
  const rotation = seed % 360;

  return (
    <div 
      className={`absolute ${side} pointer-events-none z-[-1] opacity-60 transition-transform hover:scale-110 duration-1000`}
      style={{ top: verticalPosition, transform: `rotate(${rotation}deg)` }}
    >
      {showLeaf && (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-200">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
        </svg>
      )}
      
      {showSparkle && !showLeaf && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-200">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        </svg>
      )}

      {showCloud && !showSparkle && !showLeaf && (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200">
          <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
        </svg>
      )}
    </div>
  );
}
