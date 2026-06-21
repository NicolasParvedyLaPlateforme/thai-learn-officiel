import { useCallback } from 'react';

interface UseMobileTimelineNodeClickProps {
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen?: (open: boolean) => void;
  maxLevelPerLesson: number;
}

export function useMobileTimelineNodeClick({
  setSelectedLesson,
  setModalLevel,
  setLockedReviewModalOpen,
  maxLevelPerLesson
}: UseMobileTimelineNodeClickProps) {
  return useCallback((
    lesson: any,
    level: number,
    unit: any,
    isReviewLocked: boolean,
    pathType: 'learn' | 'alphabet' | 'speak'
  ) => {
    return (e: React.MouseEvent) => {
      e.stopPropagation();
      if (isReviewLocked && setLockedReviewModalOpen) {
        setLockedReviewModalOpen(true);
        return;
      }
      const isMaxLevel = level >= maxLevelPerLesson;
      setSelectedLesson({
        lesson,
        isCompleted: isMaxLevel,
        unitColor: unit.colorClass,
        unitBorder: unit.borderClass,
        unitText: unit.textClass,
        unitHover: unit.hoverClass
      });
      const saved = localStorage.getItem(`last_${pathType}_level_${lesson.id}`);
      if (saved) {
        setModalLevel(parseInt(saved, 10));
      } else {
        setModalLevel(Math.min(level + 1, maxLevelPerLesson));
      }
    };
  }, [setSelectedLesson, setModalLevel, setLockedReviewModalOpen, maxLevelPerLesson]);
}
