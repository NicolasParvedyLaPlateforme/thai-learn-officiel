import React from 'react';
import BaseMobileTimeline from '../path-ui/BaseMobileTimeline'; // Assure-toi que le chemin est bon
import { NextUnitCard } from './NextUnitCard';

interface LearnMobileTimelineProps {
  unit: any;
  unitLessons: any[];
  activeUnitIndex: number;
  totalUnits: number;
  language: string;
  lessonLevels: Record<string, number>;
  suggestedLessonId: string | null;
  globalSuggestedLesson?: any;
  learnQuests: any[];
  mounted: boolean;
  handleUnitSelect: (index: number) => void;
  setIsUnitsModalOpen: (open: boolean) => void;
  setIsQuestsModalOpen: (open: boolean) => void;
  setSelectedLesson: (data: any) => void;
  setModalLevel: (level: number | null) => void;
  setLockedReviewModalOpen: (open: boolean) => void;
  nextUnit?: any;
}

export default function LearnMobileTimeline(props: LearnMobileTimelineProps) {
  return (
    <BaseMobileTimeline
      pathType="learn"
      maxLevelPerLesson={10}
      quests={props.learnQuests} // On mappe "learnQuests" sur la prop générique "quests"
      {...props}
    >
      {/* C'est ici qu'on utilise le "children" pour ajouter l'élément spécifique à ce parcours */}
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