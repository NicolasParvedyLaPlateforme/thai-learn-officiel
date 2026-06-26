import React from 'react';
import BaseMobileTimeline from './BaseMobileTimeline';
import { NextUnitCard } from './NextUnitCard';

interface PathMobileTimelineProps {
  pathType: 'learn' | 'alphabet' | 'speak';
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  quests: any[];
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsQuestsModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  maxLevelPerLesson?: number;
  nextUnit?: any;
}

export default function PathMobileTimeline({
  pathType,
  quests,
  maxLevelPerLesson = 10,
  ...baseProps
}: PathMobileTimelineProps) {
  return (
    <BaseMobileTimeline
      pathType={pathType}
      quests={quests}
      maxLevelPerLesson={maxLevelPerLesson}
      reviewUnlockLevel={4}
      {...baseProps}
    >
      {baseProps.nextUnit && (
        <div className="w-full">
          <NextUnitCard
            nextUnit={baseProps.nextUnit}
            nextUnitIndex={baseProps.activeUnitIndex + 1}
            language={baseProps.language}
            handleUnitSelect={baseProps.handleUnitSelect}
            isMobile={true}
          />
        </div>
      )}
    </BaseMobileTimeline>
  );
}
