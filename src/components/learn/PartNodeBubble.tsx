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

  const positionClasses = 'mt-3 lg:mt-4 mx-auto';
  // Pas de translation car l'élément est dans le flux standard
  const positionStyle: React.CSSProperties = {};

  const arrowClasses = '-top-[6px] border-b-0 border-r-0';
  const arrowStyle: React.CSSProperties = {
    left: `calc(50% + ${xOffset}px)`,
    transform: 'translateX(-50%) rotate(45deg)'
  };

  return (
    <div
      className={[
        'relative z-20 w-full',
        'flex flex-row items-center gap-2 md:gap-4',
      ].join(' ')}
      style={positionStyle}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center gap-2 shrink-0">
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
      <div className="flex items-center gap-1 md:gap-1.5 shrink-0 px-2 md:px-4">
        <Star size={16} className="text-amber-400 fill-amber-400 shrink-0" />
        <span className="text-[14px] md:text-[15px] font-bold text-amber-500">+{expectedXp} XP</span>
      </div>

      {/* CTA */}
      <Link
        href={href}
        onClick={onClose}
        className={buttonVariants({
          variant: 'gamified',
          size: 'default',
          className: [
            'h-10 md:h-11 rounded-xl text-[14px] md:text-[15px] px-4 md:px-4 justify-center ml-auto shrink-0 px-[13px]',
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
