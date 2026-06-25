import React from 'react';
import BaseMobileTimeline from '../path-ui/BaseMobileTimeline';
import { NextUnitCard } from '../learn/NextUnitCard';

interface AlphabetMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  alphabetQuests: any[];
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsQuestsModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  maxLevelPerLesson?: number;
  nextUnit?: any;
  setLockedReviewModalOpen: (open: boolean) => void;
}

export default function AlphabetMobileTimeline(props: AlphabetMobileTimelineProps) {
  // On extrait les props spécifiques qui ont besoin d'être remappées ou qui ont une valeur par défaut
  const {
    alphabetQuests,
    maxLevelPerLesson = 4,
    ...baseProps
  } = props;

  return (
    <BaseMobileTimeline
      pathType="alphabet"
      quests={alphabetQuests} // On mappe "alphabetQuests" vers la prop générique "quests"
      maxLevelPerLesson={maxLevelPerLesson}
      {...baseProps}
    >
      {/* On injecte la NextUnitCard à la fin via les children */}
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