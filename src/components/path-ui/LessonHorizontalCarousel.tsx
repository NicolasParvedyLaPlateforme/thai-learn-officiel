'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconImage from '../ui/IconImage';
import { Typography } from '../ui/Typography';
import { getLocalizedField } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import { formatCombiningChar } from "@/lib/alphabet-utils";

interface LessonHorizontalCarouselProps {
  lessons: any[];
  activeLessonIndex: number;
  onLessonChange: (index: number) => void;
  language: string;
  pathType: 'learn' | 'alphabet' | 'speak';
}

export function LessonHorizontalCarousel({
  lessons,
  activeLessonIndex,
  onLessonChange,
  language,
  pathType,
}: LessonHorizontalCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isProgrammaticScrollRef = useRef(false);

  useEffect(() => {
    // Center the active lesson icon when it changes programmatically (e.g. arrows, or initial)
    if (scrollContainerRef.current && !isProgrammaticScrollRef.current) {
      const container = scrollContainerRef.current;
      const activeElement = container.children[activeLessonIndex] as HTMLElement;
      if (activeElement) {
        const containerCenter = container.clientWidth / 2;
        const elementCenter = activeElement.offsetLeft + activeElement.clientWidth / 2;
        isProgrammaticScrollRef.current = true;
        container.scrollTo({
          left: elementCenter - containerCenter,
          behavior: 'smooth',
        });
        
        // Reset the flag after animation finishes
        setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 300);
      }
    }
  }, [activeLessonIndex, lessons.length]);

  const handleScroll = () => {
    if (isProgrammaticScrollRef.current) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;
    let closestIndex = activeLessonIndex;
    let minDistance = Infinity;

    Array.from(container.children).forEach((child, index) => {
      const childEl = child as HTMLElement;
      const childCenter = childEl.offsetLeft + childEl.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);
      
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeLessonIndex) {
      // Mark as programmatic so the subsequent useEffect doesn't fight the user scroll
      isProgrammaticScrollRef.current = true;
      onLessonChange(closestIndex);
      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 50);
    }
  };

  const handlePrev = () => {
    if (activeLessonIndex > 0) {
      onLessonChange(activeLessonIndex - 1);
    }
  };

  const handleNext = () => {
    if (activeLessonIndex < lessons.length - 1) {
      onLessonChange(activeLessonIndex + 1);
    }
  };

  const activeLesson = lessons[activeLessonIndex];

  return (
    <div className="flex flex-col w-full bg-white/95 backdrop-blur-md z-50 py-3 shadow-sm sticky top-0 border-b border-slate-100">
      <div className="flex items-center justify-between px-2 sm:px-4">
        <button
          onClick={handlePrev}
          disabled={activeLessonIndex === 0}
          className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="flex flex-col items-center flex-1 min-w-0 overflow-hidden px-2">
           <Typography variant="h3" className="w-full text-center text-sm sm:text-base font-bold text-slate-800 truncate">
              {activeLesson ? getLocalizedField(activeLesson, 'title', language) : ''}
           </Typography>
        </div>

        <button
          onClick={handleNext}
          disabled={activeLessonIndex === lessons.length - 1}
          className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-6 pt-3 pb-3 scrollbar-hide px-[calc(50vw-32px)] sm:px-[calc(50%-32px)] box-border items-center"
        style={{ scrollPadding: '0' }}
      >
        {lessons.map((lesson, idx) => {
          const isActive = idx === activeLessonIndex;
          return (
            <div
              key={lesson.id}
              onClick={() => onLessonChange(idx)}
              // Outer container: FIXED size to prevent any layout shift
              className="relative shrink-0 cursor-pointer flex items-center justify-center w-[72px] h-[72px]"
            >
              <div
                className={cn(
                  "rounded-full flex items-center justify-center transition-all duration-300 transform",
                  isActive 
                    ? "w-[60px] h-[60px] border-4 border-emerald-500 scale-110 shadow-md opacity-100" 
                    : "w-[56px] h-[56px] border-2 border-slate-200 scale-100 opacity-60 hover:opacity-100"
                )}
              >
                {lesson.imageUrl ? (
                  <div className="w-full h-full rounded-full overflow-hidden relative">
                     <IconImage src={lesson.imageUrl} alt={lesson.title} fill className="object-cover" sizes="60px" />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center">
                    <span className="font-thai text-xl font-bold text-slate-600">
                      {pathType === 'alphabet' ? lesson.items?.[0]?.letter?.[0] : lesson.title?.[0]}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
