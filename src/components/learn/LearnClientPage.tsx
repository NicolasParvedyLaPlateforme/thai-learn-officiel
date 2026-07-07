'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { computeUnits } from "@/lib/lesson-utils";
import BASE_UNITS from "@/data/units.json";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";

import dynamic from 'next/dynamic';

import PathMobileTimeline from '../path-ui/PathMobileTimeline';
import PathDesktopTimeline from '../path-ui/PathDesktopTimeline';
import { DesktopLessonLevelsView } from './DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const UnitsModal = dynamic(() => import('../modals/UnitsModal'), { ssr: false });
const QuestsModal = dynamic(() => import('../modals/QuestsModal'), { ssr: false });
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
      renderMobileTimeline={({ key, ...props }: any) => <PathMobileTimeline key={key} {...props} pathType="learn" quests={learnQuests} />}
      renderDesktopTimeline={({ key, ...props }: any) => <PathDesktopTimeline key={key} {...props} pathType="learn" maxLevelPerLesson={10} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="learn" />}
      renderUnitsModal={(props) => <UnitsModal {...props} />}
      renderQuestsModal={(props) => <QuestsModal {...props} />}
      renderLockedReviewModal={(props) => <LockedReviewModal {...props} />}
    />
  );
}
