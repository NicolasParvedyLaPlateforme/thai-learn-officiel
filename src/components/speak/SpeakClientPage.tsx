'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import BASE_UNITS from "@/data/speak_units.json";
import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";

import dynamic from 'next/dynamic';

import SpeakMobileTimeline from './SpeakMobileTimeline';
import SpeakDesktopTimeline from './SpeakDesktopTimeline';
import { DesktopLessonLevelsView } from '../learn/DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const SpeakLessonModal = dynamic(() => import('./SpeakLessonModal'), { ssr: false });
const SpeakUnitsModal = dynamic(() => import('./SpeakUnitsModal'), { ssr: false });
const SpeakQuestsModal = dynamic(() => import('./SpeakQuestsModal'), { ssr: false });
const SpeakLockedReviewModal = dynamic(() => import('./SpeakLockedReviewModal'), { ssr: false });

export default function SpeakClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const data = { lessons: lightweightLessons };

  const UNITS = useMemo(() => {
    const computedUnits = [];
    let currentStartIndex = 0;

    for (let i = 0; i < BASE_UNITS.length; i++) {
      const baseUnit = BASE_UNITS[i];
      let endIndex = currentStartIndex;

      for (let j = currentStartIndex; j < data.lessons.length; j++) {
        const title = data.lessons[j].title || "";
        const titleEn = data.lessons[j].titleEn || "";
        if (title.toLowerCase().includes("bilan") || titleEn.toLowerCase().includes("review")) {
          endIndex = j + 1;
          break;
        }
      }

      if (endIndex === currentStartIndex && currentStartIndex < data.lessons.length) {
        endIndex = data.lessons.length;
      }

      computedUnits.push({
        ...baseUnit,
        startIndex: currentStartIndex,
        endIndex: endIndex
      });

      currentStartIndex = endIndex;
    }
    return computedUnits;
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
      maxLevelPerLesson={10}
      renderMobileTimeline={(props) => <SpeakMobileTimeline {...props} speakQuests={speakQuests} />}
      renderDesktopTimeline={(props) => <SpeakDesktopTimeline {...props} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="speak" />}
      renderLessonModal={(props) => <SpeakLessonModal {...props} />}
      renderUnitsModal={(props) => <SpeakUnitsModal {...props} />}
      renderQuestsModal={(props) => <SpeakQuestsModal {...props} />}
      renderLockedReviewModal={(props) => <SpeakLockedReviewModal {...props} />}
    />
  );
}
