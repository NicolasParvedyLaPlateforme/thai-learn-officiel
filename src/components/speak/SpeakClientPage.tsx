'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { computeUnits } from "@/lib/lesson-utils";
import BASE_UNITS from "@/data/speak_units.json";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";

import dynamic from 'next/dynamic';

import SpeakMobileTimeline from './SpeakMobileTimeline';
import SpeakDesktopTimeline from './SpeakDesktopTimeline';
import { DesktopLessonLevelsView } from '../learn/DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const SpeakLessonModal = dynamic(() => import('./SpeakLessonModal'), { ssr: false });
const SpeakUnitsModal = dynamic(() => import('./SpeakUnitsModal'), { ssr: false });
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
      renderMobileTimeline={(props) => <SpeakMobileTimeline {...props} speakQuests={speakQuests} />}
      renderDesktopTimeline={(props) => <SpeakDesktopTimeline {...props} maxLevelPerLesson={5} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="speak" maxLevelPerLesson={5} />}
      renderLessonModal={(props) => <SpeakLessonModal {...props} />}
      renderUnitsModal={(props) => <SpeakUnitsModal {...props} />}
      renderQuestsModal={(props) => <QuestsModal category="speak" {...props} />}
      renderLockedReviewModal={(props) => <LockedReviewModal {...props} />}
    />
  );
}
