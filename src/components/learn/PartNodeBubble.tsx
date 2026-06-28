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
  
  let placement = 'right';

  if (partIndex !== 'full') {
    const angle = 360 / totalParts;
    const midAngle = (partIndex * angle) - 90 + (angle / 2);
    const normalized = (midAngle + 360) % 360; // 0 is right, 90 is bottom, 180 is left, 270 is top
    
    if (normalized >= 45 && normalized <= 135) {
      placement = 'bottom';
    } else if (normalized >= 225 && normalized <= 315) {
      placement = 'top';
    } else if (normalized > 135 && normalized < 225) {
      // Wants left
      if (nodeX < 0) {
        placement = normalized < 180 ? 'bottom' : 'top';
      } else {
        placement = 'left';
      }
    } else {
      // Wants right
      if (nodeX > 0) {
        placement = normalized > 270 || normalized < 0 ? 'top' : 'bottom';
      } else {
        placement = 'right';
      }
    }
  } else {
    placement = nodeX <= 0 ? 'right' : 'left';
  }

  let positionClasses = '';
  let arrowClasses = '';
  let arrowStyle: React.CSSProperties = {};

  let xOffset = 0;
  let yOffset = 0;
  
  if (partIndex !== 'full') {
    const angle = 360 / totalParts;
    const midAngle = (partIndex * angle) - 90 + (angle / 2);
    const normalized = (midAngle + 360) % 360;
    
    // Calculate precise arrow offset using trig (radius ~45px for the pizza slices)
    xOffset = Math.cos(normalized * Math.PI / 180) * 45;
    yOffset = Math.sin(normalized * Math.PI / 180) * 45;
  }

  switch (placement) {
    case 'bottom':
      positionClasses = 'top-full mt-3 lg:mt-5 left-1/2 -translate-x-1/2';
      arrowClasses = '-top-[6px] border-b-0 border-r-0';
      arrowStyle = { left: `calc(50% + ${xOffset}px)`, transform: 'translateX(-50%) rotate(45deg)' };
      break;
    case 'top':
      positionClasses = 'bottom-full mb-3 lg:mb-5 left-1/2 -translate-x-1/2';
      arrowClasses = '-bottom-[6px] border-t-0 border-l-0';
      arrowStyle = { left: `calc(50% + ${xOffset}px)`, transform: 'translateX(-50%) rotate(45deg)' };
      break;
    case 'left':
      positionClasses = 'right-full mr-3 lg:mr-5 top-1/2 -translate-y-1/2';
      arrowClasses = '-right-[6px] border-b-0 border-l-0';
      arrowStyle = { top: `calc(50% + ${yOffset}px)`, transform: 'translateY(-50%) rotate(45deg)' };
      break;
    case 'right':
    default:
      positionClasses = 'left-full ml-3 lg:ml-5 top-1/2 -translate-y-1/2';
      arrowClasses = '-left-[6px] border-t-0 border-r-0';
      arrowStyle = { top: `calc(50% + ${yOffset}px)`, transform: 'translateY(-50%) rotate(45deg)' };
      break;
  }

  return (
    <div
      className={[
        'absolute z-50',
        positionClasses,
        'w-[180px]',
        'bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-slate-100',
        'flex flex-col gap-3 p-3.5',
      ].join(' ')}
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
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-full ${unitColor} flex items-center justify-center shrink-0`}>
          {isCompleted
            ? <CheckCircle2 size={14} className="text-white stroke-[2.5]" />
            : <Play size={10} className="text-white fill-current ml-0.5" />
          }
        </div>
        <span className={`text-[13px] font-extrabold ${unitText} leading-tight`}>
          {partIndex === 'full' ? `Niveau ${levelIndex + 1}` : `Partie ${(partIndex as number) + 1}`}
        </span>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 px-0.5">
        {stepsCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Flag size={12} className="text-slate-400 shrink-0" />
            <span className="text-[11px] font-bold text-slate-500">{stepsCount}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Star size={12} className="text-amber-400 fill-amber-400 shrink-0" />
          <span className="text-[11px] font-bold text-amber-500">+{expectedXp} XP</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        href={href}
        onClick={onClose}
        className={buttonVariants({
          variant: 'gamified',
          size: 'sm',
          className: [
            'w-full rounded-xl text-[12px] justify-center',
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
