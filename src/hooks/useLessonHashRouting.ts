import { useState, useLayoutEffect, useEffect } from 'react';
import { useProgressStore } from "@/lib/store";

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export function useLessonHashRouting(
  lessons: any[],
  units: any[],
  pathType: 'learn' | 'alphabet' | 'speak',
  completedLessons: string[],
  setActiveUnitIndex: (index: number) => void,
  setSelectedLesson: (lessonData: any) => void,
  setModalLevel: (level: number | null) => void,
  setMounted: (mounted: boolean) => void,
  autoDetectLanguage: () => void
) {
  const [isProcessingHash, setIsProcessingHash] = useState(true);

  useIsomorphicLayoutEffect(() => {
    if (!isProcessingHash) return;
    
    const hash = window.location.hash;
    if (hash && hash.startsWith('#lesson-')) {
      try {
        const baseId = hash.substring(1).replace('lesson-', '');

        if (!lessons || !Array.isArray(lessons)) return;
        
        const foundLesson = lessons.find(l => l && l.id === baseId);
        if (foundLesson) {
          const isCompleted = (completedLessons && Array.isArray(completedLessons)) ? completedLessons.includes(baseId) : false;

          let unitIndex = -1;
          if (pathType === 'learn' || pathType === 'speak') {
            const targetIdx = lessons.findIndex(l => l && l.id === baseId);
            if (units && Array.isArray(units)) {
              unitIndex = units.findIndex(u => u && targetIdx >= (u.startIndex ?? 0) && targetIdx < (u.endIndex ?? 0));
            }
          } else if (pathType === 'alphabet') {
            if (units && Array.isArray(units)) {
              unitIndex = units.findIndex(u => u?.lessons?.some((l: any) => l?.id === baseId));
            }
          }

          if (unitIndex !== -1 && units && units[unitIndex]) {
            const unit = units[unitIndex];
            
            let parsedLastLvl = undefined;
            try {
              const lastLvlStr = localStorage.getItem(`last_level_${baseId}`);
              parsedLastLvl = lastLvlStr !== null && !isNaN(parseInt(lastLvlStr, 10)) ? parseInt(lastLvlStr, 10) : undefined;
            } catch (storageErr) {
              console.warn("Could not read localStorage for last level:", storageErr);
            }

            setSelectedLesson({
              lesson: foundLesson,
              isCompleted,
              unitColor: unit.colorClass || 'bg-emerald-500',
              unitBorder: unit.borderClass || 'border-emerald-600',
              unitText: unit.textClass || 'text-emerald-500',
              unitHover: unit.hoverClass || 'hover:bg-emerald-50',
              initialScrollLevel: parsedLastLvl
            });
            setActiveUnitIndex(unitIndex);

            if (parsedLastLvl !== undefined && typeof window !== 'undefined' && window.innerWidth >= 1280) {
              setModalLevel(parsedLastLvl);
            }
          }
        }

        setTimeout(() => {
          try {
            const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
            
            // We use standard ID selection but catch any CSS syntax errors just in case
            let el: Element | null = null;
            try {
               const targetId = isDesktop ? `#desktop-lesson-${baseId}` : `#mobile-lesson-${baseId}`;
               el = document.querySelector(targetId);
               if (!el) el = document.querySelector(hash);
            } catch (queryErr) {
               console.warn("Invalid selector format for lesson hash scrolling", queryErr);
            }

            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 100;
              window.scrollTo({ top: y, behavior: 'smooth' });
            }
          } catch (scrollErr) {
            console.error("Scroll error:", scrollErr);
          }
        }, 50);
      } catch (e) {
        console.error("Error inside useLessonHashRouting:", e);
      }
    }

    setIsProcessingHash(false);
    setMounted(true);
    autoDetectLanguage();
    useProgressStore.getState().checkAndGenerateQuests();
  }, [autoDetectLanguage, lessons, completedLessons, units, pathType, setActiveUnitIndex, setSelectedLesson, setModalLevel, setMounted]);

  return isProcessingHash;
}
