import React, { ReactNode } from 'react';
import { m } from 'framer-motion';
import { Crown, CheckCircle, Lock, Star, Play } from 'lucide-react';
import PathTimelineLine from './PathTimelineLine';
import { PathDecorations } from './PathDecorations';
import { cn } from '@/lib/utils';
import IconImage from '../ui/IconImage';

interface MobileTimelineNodeLayoutProps {
  lessonId: string;
  index: number;
  level: number;
  maxLevel: number;
  unitColorClass: string;
  unitTextClass: string;
  unitShades: any;
  isReviewLocked: boolean;
  isMaxLevel: boolean;
  isReview?: boolean;
  onNodeClick: (e: React.MouseEvent) => void;
  cardContent: ReactNode;
  showLevelProgress?: boolean;
  lesson: any;
  isDesktopLayout?: boolean;
}

export function MobileTimelineNodeLayout({
  lessonId,
  index,
  level,
  maxLevel,
  unitColorClass,
  unitTextClass,
  unitShades,
  isReviewLocked,
  isMaxLevel,
  isReview,
  onNodeClick,
  cardContent,
  showLevelProgress = false,
  lesson,
  isDesktopLayout = false
}: MobileTimelineNodeLayoutProps) {
  const getShadeClass = () => {
    if (isMaxLevel) return `${unitColorClass} text-white border-white shadow-[0_0_15px_rgba(16,185,129,0.3)]`;
    if (isReviewLocked) return 'bg-slate-100 text-slate-300 border-white';

    if (maxLevel <= 4) {
      if (level >= 3) return `${unitShades.l3} border-white`;
      if (level >= 2) return `${unitShades.l2} border-white`;
      if (level >= 1) return `${unitShades.l1} border-white`;
    } else {
      if (level >= 8) return `${unitShades.l4} border-white`;
      if (level >= 6) return `${unitShades.l3} border-white`;
      if (level >= 3) return `${unitShades.l2} border-white`;
      if (level >= 1) return `${unitShades.l1} border-white`;
    }

    return `bg-white ${unitTextClass} border-slate-200`;
  };

  // const centerIcon = () => {
  //   if (isMaxLevel) return <CheckCircle size={22} className="stroke-[3]" />;
  //   if (isReviewLocked) return <Lock size={18} className="fill-slate-200 text-slate-400 stroke-[2.5]" />;
  //   if (level > 0) return <CheckCircle size={22} className="stroke-current stroke-[2.5]" />;
  //   if (isReview) return <Star size={20} className="fill-current stroke-current" />;
  //   return <Play size={22} className="ml-0.5 fill-current stroke-[2]" />;
  // };

  const centerIcon = () => {
    const dynamicColor = lesson.color ? `bg-${lesson.color}-500` : `bg-${unitColorClass}`;
    return lesson.imageUrl ? (
      <IconImage
        src={lesson.imageUrl}
        alt={lesson.title}
        fill
        className="object-cover"
        sizes="80px"
      />
    ) : (
      <div className={cn("w-full h-full", dynamicColor, "opacity-30")} />
    )
  }

  const prefix = isDesktopLayout ? 'desktop' : 'mobile';

  return (
    <m.div
      id={`${prefix}-lesson-${lessonId}`}
      key={`${prefix}-node-${lessonId}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
      style={{ zIndex: 100 - index }}
      className={cn("relative flex flex-col items-center w-full gap-3 sm:gap-4 scroll-mt-32",
        index === 0 ? "mt-0" : "mt-16 sm:mt-16"
      )}
    >
      {/* Lesson Card */}
      <div className="w-full min-w-0 z-10">
        {cardContent}
      </div>

    </m.div>
  );
}
