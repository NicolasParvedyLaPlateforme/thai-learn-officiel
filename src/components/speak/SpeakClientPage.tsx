'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { computeUnits } from "@/lib/lesson-utils";
import BASE_UNITS from "@/data/speak_units.json";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";

import dynamic from 'next/dynamic';

import PathMobileTimeline from '../path-ui/PathMobileTimeline';
import PathDesktopTimeline from '../path-ui/PathDesktopTimeline';
import { DesktopLessonLevelsView } from '../learn/DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const PathLessonModal = dynamic(() => import('../path-ui/PathLessonModal'), { ssr: false });
const UnitsModal = dynamic(() => import('../modals/UnitsModal'), { ssr: false });
const QuestsModal = dynamic(() => import('../modals/QuestsModal'), { ssr: false });
const LockedReviewModal = dynamic(() => import('../modals/LockedReviewModal'), { ssr: false });

export default function SpeakClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const data = { lessons: lightweightLessons };

  const UNITS = useMemo(() => {
    return computeUnits(BASE_UNITS, data.lessons);
  }, [lightweightLessons, data.lessons.length]);

  const { dailyQuests } = useProgressStore();
  const speakQuests = dailyQuests?.speak || [];
  
  const globalSuggested = null as any; // global suggested is not enabled for speak in the current version
  const suggestedLessonId = null;

  return (
    <PathLayout
      pathType="speak"
      units={UNITS}
      lessons={data.lessons}
      quests={speakQuests}
      globalSuggested={globalSuggested}
      suggestedLessonId={suggestedLessonId}
      maxLevelPerLesson={5}
      renderMobileTimeline={(props) => <PathMobileTimeline {...props} pathType="speak" quests={speakQuests} maxLevelPerLesson={5} />}
      renderDesktopTimeline={(props) => <PathDesktopTimeline {...props} pathType="speak" maxLevelPerLesson={5} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="speak" maxLevelPerLesson={5} />}
      renderLessonModal={(props) => <PathLessonModal {...props} pathType="speak" maxLevelPerLesson={5} />}
      renderUnitsModal={(props) => <UnitsModal {...props} />}
      renderQuestsModal={(props) => <QuestsModal category="speak" {...props} />}
      renderLockedReviewModal={(props) => <LockedReviewModal {...props} />}
    />
  );
}
