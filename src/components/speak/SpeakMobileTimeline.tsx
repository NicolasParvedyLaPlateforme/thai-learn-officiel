import React from 'react';
import BaseMobileTimeline from '../path-ui/BaseMobileTimeline';
import { NextUnitCard } from '../learn/NextUnitCard';

interface SpeakMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  speakQuests: any[];
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

export default function SpeakMobileTimeline(props: SpeakMobileTimelineProps) {
  const {
    speakQuests,
    maxLevelPerLesson = 5,
    ...baseProps
  } = props;

  return (
    <BaseMobileTimeline
      pathType="speak"
      quests={speakQuests}
      maxLevelPerLesson={maxLevelPerLesson}
      reviewUnlockLevel={4} // Explicite, même si c'est la valeur par défaut
      {...baseProps}
    >
      {props.nextUnit && (
        <div className="w-full">
          <NextUnitCard
            nextUnit={props.nextUnit}
            nextUnitIndex={props.activeUnitIndex + 1}
            language={props.language}
            handleUnitSelect={props.handleUnitSelect}
            isMobile={true}
          />
        </div>
      )}
    </BaseMobileTimeline>
  );
}