import { useState, useEffect } from 'react';

export function useActiveUnit(
  mounted: boolean,
  units: any[],
  lessons: any[],
  completedLessons: string[],
  pathType: 'learn' | 'alphabet' | 'speak',
  lastActiveUnitIndex: number | undefined,
  setLastActiveUnitIndex: (index: number) => void
) {
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);

  useEffect(() => {
    if (!mounted || units.length === 0) return;

    let targetIndex = 0;

    const params = new URLSearchParams(window.location.search);
    const unitParam = params.get('unit');
    if (pathType === 'alphabet' && unitParam && parseInt(unitParam) >= 0 && parseInt(unitParam) < units.length) {
      targetIndex = parseInt(unitParam);
      window.history.replaceState({}, '', `/${pathType}`);
    } else if (lastActiveUnitIndex !== undefined && lastActiveUnitIndex >= 0 && lastActiveUnitIndex < units.length) {
      targetIndex = lastActiveUnitIndex;
    } else {
      const lastUnlockedIndex = lessons.findIndex(l => !completedLessons.includes(l.id));
      const targetLessonIndex = lastUnlockedIndex === -1 ? lessons.length - 1 : lastUnlockedIndex;
      if (targetLessonIndex !== -1) {
        if (pathType === 'learn') {
          const unitIndex = units.findIndex(u => targetLessonIndex >= u.startIndex && targetLessonIndex < u.endIndex);
          if (unitIndex !== -1) targetIndex = unitIndex;
        } else if (pathType === 'alphabet') {
          const targetLesson = lessons[targetLessonIndex];
          const unitIndex = units.findIndex(u => u.lessons?.some((l: any) => l.id === targetLesson.id));
          if (unitIndex !== -1) targetIndex = unitIndex;
        } else if (pathType === 'speak') {
          const unitIndex = units.findIndex(u => targetLessonIndex >= u.startIndex && targetLessonIndex < u.endIndex);
          if (unitIndex !== -1) targetIndex = unitIndex;
        }
      }
    }

    setActiveUnitIndex(targetIndex);
    if (pathType !== 'alphabet') {
      setLastActiveUnitIndex(targetIndex);
    }
  }, [mounted, lastActiveUnitIndex, setLastActiveUnitIndex, units, lessons, completedLessons, pathType]);

  const handleUnitSelect = (index: number) => {
    setActiveUnitIndex(index);
    setLastActiveUnitIndex(index);
    
    // Clean hash from URL when changing units
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return { activeUnitIndex, setActiveUnitIndex, handleUnitSelect };
}
