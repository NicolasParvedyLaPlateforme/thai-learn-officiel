import React from 'react';
import { m } from 'framer-motion';
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
  selectedLesson?: any;
  modalLevel?: number | null;
  lessonStars?: Record<string, number[]>;
  maxLevelPerLesson?: number;
  nextUnit?: any;
}

export default function PathMobileTimeline(props: PathMobileTimelineProps) {
  return (
    <BaseMobileTimeline {...props}>
      {props.nextUnit && (
        <m.div 
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-x-visible overflow-y-clip w-full relative z-20"
        >
          <NextUnitCard
            nextUnit={props.nextUnit}
            nextUnitIndex={props.activeUnitIndex + 1}
            language={props.language}
            handleUnitSelect={props.handleUnitSelect}
            isMobile={true}
          />
        </m.div>
      )}
    </BaseMobileTimeline>
  );
}
