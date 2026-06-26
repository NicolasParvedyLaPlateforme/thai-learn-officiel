'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { computeUnits } from "@/lib/lesson-utils";
import BASE_UNITS from "@/data/units.json";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";

import dynamic from 'next/dynamic';

import LearnMobileTimeline from './LearnMobileTimeline';
import LearnDesktopTimeline from './LearnDesktopTimeline';
import { DesktopLessonLevelsView } from './DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const LearnLessonModal = dynamic(() => import('./LearnLessonModal'), { ssr: false });
const LearnUnitsModal = dynamic(() => import('./LearnUnitsModal'), { ssr: false });
const LearnQuestsModal = dynamic(() => import('./LearnQuestsModal'), { ssr: false });
const LockedReviewModal = dynamic(() => import('../modals/LockedReviewModal'), { ssr: false });

export default function LearnClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const data = { lessons: lightweightLessons };

  const UNITS = useMemo(() => {
    return computeUnits(BASE_UNITS, data.lessons);
  }, [lightweightLessons, data.lessons.length]);

  const { dailyQuests } = useProgressStore();
  const learnQuests = dailyQuests?.learn || [];
  
  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  const suggestedLessonId = globalSuggested?.type === 'learn' ? globalSuggested.id : null;

  return (
    <PathLayout
      pathType="learn"
      units={UNITS}
      lessons={data.lessons}
      quests={learnQuests}
      globalSuggested={globalSuggested}
      suggestedLessonId={suggestedLessonId}
      maxLevelPerLesson={10}
      renderMobileTimeline={(props) => <LearnMobileTimeline {...props} learnQuests={learnQuests} />}
      renderDesktopTimeline={(props) => <LearnDesktopTimeline {...props} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="learn" />}
      renderLessonModal={(props) => <LearnLessonModal {...props} />}
      renderUnitsModal={(props) => <LearnUnitsModal {...props} />}
      renderQuestsModal={(props) => <LearnQuestsModal {...props} />}
      renderLockedReviewModal={(props) => <LockedReviewModal {...props} />}
    />
  );
}
