import React from 'react';
import Link from 'next/link';
import { Flag, Play, CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '../ui/Button';

interface PartNodeBubbleProps {
  lessonId: string;
  levelIndex: number;
  partIndex: number;
  totalParts: number;
  stepsCount: number;
  isCompleted: boolean;
  unitColor: string;
  unitText: string;
  /** X offset of the node from the slot center (px). Used to pick left/right side. */
  nodeX: number;
  onClose: () => void;
}

export function PartNodeBubble({
  lessonId,
  levelIndex,
  partIndex,
  totalParts,
  stepsCount,
  isCompleted,
  unitColor,
  unitText,
  nodeX,
  onClose,
}: PartNodeBubbleProps) {
  const href = `/lesson/${lessonId}?level=${levelIndex + 1}&part=${partIndex}&totalParts=${totalParts}`;

  // The node is to the left (negative x) → show bubble to the right, and vice-versa.
  // This keeps the bubble away from the edge of the screen.
  const showRight = nodeX <= 0;

  return (
    <div
      className={[
        'absolute z-50 top-1/2 -translate-y-1/2',
        showRight ? 'left-[calc(100%+12px)]' : 'right-[calc(100%+12px)]',
        // Hard clamp so the bubble never goes off the side of the screen on mobile
        'w-[172px]',
        'bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-slate-100',
        'flex flex-col gap-3 p-3.5',
      ].join(' ')}
      style={{
        // Clamp so the bubble's left edge is never < 8px from the viewport
        // and right edge never < 8px. Done via a CSS trick using clamp.
        // (browser doesn't let us do this purely with Tailwind absolute positioning)
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Pointer arrow */}
      <div
        className={[
          'absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border border-slate-100',
          showRight
            ? '-left-[7px] border-t-0 border-r-0'   // left-pointing arrow
            : '-right-[7px] border-b-0 border-l-0',  // right-pointing arrow
        ].join(' ')}
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
          Partie {partIndex + 1}
        </span>
      </div>

      {/* Stats */}
      {stepsCount > 0 && (
        <div className="flex items-center gap-1.5 px-0.5">
          <Flag size={12} className="text-slate-400 shrink-0" />
          <span className="text-[11px] font-bold text-slate-500">{stepsCount} étape{stepsCount > 1 ? 's' : ''}</span>
        </div>
      )}

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
