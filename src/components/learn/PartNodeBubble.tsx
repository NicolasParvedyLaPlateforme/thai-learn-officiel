import React from 'react';
import Link from 'next/link';
import { Flag, Play, CheckCircle2, Star } from 'lucide-react';
import { buttonVariants } from '../ui/Button';

interface PartNodeBubbleProps {
  lessonId: string;
  levelIndex: number;
  partIndex: number | 'full';
  totalParts: number;
  stepsCount: number;
  expectedXp: number;
  isCompleted: boolean;
  unitColor: string;
  unitText: string;
  /** X offset of the node from the slot center (px). Used to pick left/right side. */
  nodeX: number;
  onClose: () => void;
  suggestionType?: string;
}

export function PartNodeBubble({
  lessonId,
  levelIndex,
  partIndex,
  totalParts,
  stepsCount,
  expectedXp,
  isCompleted,
  unitColor,
  unitText,
  nodeX,
  onClose,
  suggestionType = 'learn'
}: PartNodeBubbleProps) {
  const getHref = () => {
    if (suggestionType === 'alphabet') return `/alphabet/lesson/${lessonId}?level=${levelIndex + 1}`;
    if (suggestionType === 'speak') return `/speak/lesson/${lessonId}?level=${levelIndex + 1}`;
    
    if (partIndex === 'full' || totalParts <= 1) {
      return `/lesson/${lessonId}?level=${levelIndex + 1}`;
    }
    return `/lesson/${lessonId}?level=${levelIndex + 1}&part=${partIndex}&totalParts=${totalParts}`;
  };

  const href = getHref();
  
  let xOffset = 0;
  
  if (partIndex !== 'full') {
    const angle = 360 / totalParts;
    const midAngle = (partIndex * angle) - 90 + (angle / 2);
    const normalized = (midAngle + 360) % 360;
    
    // Calculate precise arrow offset using trig (radius ~45px for the pizza slices)
    xOffset = Math.cos(normalized * Math.PI / 180) * 45;
  }

  // Prevent horizontal overflow on mobile by shifting the bubble if node is near edges
  let translateXPercentage = 50;
  if (nodeX > 30) {
    translateXPercentage = 75;
  } else if (nodeX < -30) {
    translateXPercentage = 25;
  }

  const positionClasses = 'top-full mt-3 lg:mt-4 left-1/2';
  const positionStyle: React.CSSProperties = { transform: `translateX(-${translateXPercentage}%)` };

  const arrowClasses = '-top-[6px] border-b-0 border-r-0';
  const arrowStyle: React.CSSProperties = { 
    left: `calc(${translateXPercentage}% + ${xOffset}px)`, 
    transform: 'translateX(-50%) rotate(45deg)' 
  };

  return (
    <div
      className={[
        'absolute z-[100]',
        positionClasses,
        'w-max max-w-[calc(100vw-32px)]',
        'bg-white rounded-[24px] shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-slate-100',
        'flex flex-row items-center gap-3 md:gap-4 p-2.5 pr-3 md:p-3 md:pr-4',
      ].join(' ')}
      style={positionStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pointer arrow */}
      <div
        className={[
          'absolute w-3 h-3 bg-white border border-slate-100',
          arrowClasses,
        ].join(' ')}
        style={arrowStyle}
      />

      {/* Header */}
      <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
        <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full ${unitColor} flex items-center justify-center shrink-0`}>
          {isCompleted
            ? <CheckCircle2 size={16} className="text-white stroke-[2.5]" />
            : <Play size={12} className="text-white fill-current ml-0.5" />
          }
        </div>
        <span className={`text-[14px] md:text-[15px] font-extrabold ${unitText} leading-tight whitespace-nowrap`}>
          {partIndex === 'full' ? `Niveau ${levelIndex + 1}` : `Partie ${(partIndex as number) + 1}`}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 px-1 md:px-2 shrink-0">
        {stepsCount > 0 && (
          <div className="flex items-center gap-1 md:gap-1.5">
            <Flag size={14} className="text-slate-400 shrink-0" />
            <span className="text-[13px] md:text-[14px] font-bold text-slate-500">{stepsCount}</span>
          </div>
        )}
        <div className="flex items-center gap-1 md:gap-1.5">
          <Star size={14} className="text-amber-400 fill-amber-400 shrink-0" />
          <span className="text-[13px] md:text-[14px] font-bold text-amber-500">+{expectedXp} XP</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={href}
        onClick={onClose}
        className={buttonVariants({
          variant: 'gamified',
          size: 'default',
          className: [
            'h-9 md:h-10 rounded-[14px] text-[13px] md:text-[14px] px-4 md:px-6 min-w-[90px] md:min-w-[100px] justify-center ml-auto shrink-0',
            unitColor,
            unitColor.replace('bg-', 'border-').replace(/500$/, '600').replace(/400$/, '500'),
          ].join(' '),
        })}
      >
        {isCompleted ? 'Rejouer' : 'Commencer'}
      </Link>
    </div>
  );
}
