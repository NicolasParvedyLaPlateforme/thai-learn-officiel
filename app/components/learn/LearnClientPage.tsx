'use client';

import { useMemo } from 'react';
import { useProgressStore } from '../../lib/store';
import BASE_UNITS from '../../data/units.json';
import { useGlobalSuggestedLesson } from '../../lib/useGlobalSuggestedLesson';

import dynamic from 'next/dynamic';

import LearnMobileTimeline from './LearnMobileTimeline';
import LearnDesktopTimeline from './LearnDesktopTimeline';
import { DesktopLessonLevelsView } from './DesktopLessonLevelsView';
import PathLayout from '../path-ui/PathLayout';

const LearnLessonModal = dynamic(() => import('./LearnLessonModal'), { ssr: false });
const LearnUnitsModal = dynamic(() => import('./LearnUnitsModal'), { ssr: false });
const LearnQuestsModal = dynamic(() => import('./LearnQuestsModal'), { ssr: false });
const LearnLockedReviewModal = dynamic(() => import('./LearnLockedReviewModal'), { ssr: false });

export default function LearnClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
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
      renderLockedReviewModal={(props) => <LearnLockedReviewModal {...props} />}
    />
  );
}
