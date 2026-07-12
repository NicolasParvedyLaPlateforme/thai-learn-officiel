import React from 'react';
import { m } from 'framer-motion';
import BaseMobileTimeline from './BaseMobileTimeline';
import { NextUnitCard } from './NextUnitCard';
import { UnitsListCompact } from './UnitsListCompact';

interface PathMobileTimelineProps {
  pathType: 'learn' | 'alphabet' | 'speak';
  units: any[];
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
          className="overflow-visible w-full relative z-20"
        >
          <NextUnitCard
            nextUnit={props.nextUnit}
            nextUnitIndex={props.activeUnitIndex + 1}
            language={props.language}
            handleUnitSelect={props.handleUnitSelect}
            isMobile={true}
          />
          <div className="mt-8">
            <UnitsListCompact
              units={props.units || []}
              activeUnitIndex={props.activeUnitIndex}
              language={props.language}
              onUnitSelect={(idx) => {
                 props.handleUnitSelect(idx);
                 setTimeout(() => {
                     const scrollContainer = document.getElementById('path-scroll-container');
                     if (scrollContainer) {
                         const screen2 = document.getElementById('mobile-screen-2');
                         if (screen2) {
                             scrollContainer.scrollTo({ top: screen2.offsetTop, behavior: 'smooth' });
                         }
                     }
                 }, 100);
              }}
            />
          </div>
        </m.div>
      )}
    </BaseMobileTimeline>
  );
}
