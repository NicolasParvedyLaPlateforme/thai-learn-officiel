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
    const hash = window.location.hash;
    if (hash && hash.startsWith('#lesson-')) {
      try {
        const baseId = hash.substring(1).replace('lesson-', '');

        const foundLesson = lessons.find(l => l.id === baseId);
        if (foundLesson) {
          const isCompleted = completedLessons.includes(baseId);

          let unitIndex = -1;
          if (pathType === 'learn' || pathType === 'speak') {
            const targetIdx = lessons.findIndex(l => l.id === baseId);
            unitIndex = units.findIndex(u => targetIdx >= u.startIndex && targetIdx < u.endIndex);
          } else if (pathType === 'alphabet') {
            unitIndex = units.findIndex(u => u.lessons?.some((l: any) => l.id === baseId));
          }

          if (unitIndex !== -1) {
            const unit = units[unitIndex];
            const lastLvlStr = localStorage.getItem(`last_level_${baseId}`);
            const parsedLastLvl = lastLvlStr !== null ? parseInt(lastLvlStr, 10) : undefined;

            setSelectedLesson({
              lesson: foundLesson,
              isCompleted,
              unitColor: unit.colorClass,
              unitBorder: unit.borderClass,
              unitText: unit.textClass,
              unitHover: unit.hoverClass,
              initialScrollLevel: parsedLastLvl
            });
            setActiveUnitIndex(unitIndex);

            if (parsedLastLvl !== undefined && window.innerWidth >= 1280) {
              setModalLevel(parsedLastLvl);
            }
          }
        }

        setTimeout(() => {
          const isDesktop = window.innerWidth >= 768;
          const targetId = isDesktop ? `#desktop-lesson-${baseId}` : `#mobile-lesson-${baseId}`;

          let el = document.querySelector(targetId);
          if (!el) {
            el = document.querySelector(hash);
          }

          if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        }, 50);
      } catch (e) {
        console.error(e);
      }
    }

    setIsProcessingHash(false);
    setMounted(true);
    autoDetectLanguage();
    useProgressStore.getState().checkAndGenerateQuests();
  }, [autoDetectLanguage, lessons, completedLessons, units, pathType, setActiveUnitIndex, setSelectedLesson, setModalLevel, setMounted]);

  return isProcessingHash;
}
