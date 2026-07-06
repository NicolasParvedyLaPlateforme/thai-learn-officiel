'use client';

import { useMemo } from 'react';
import { useProgressStore } from "@/lib/store";
import { getAlphabetLessons } from "@/lib/alphabet-utils";

import { useGlobalSuggestedLesson } from "@/hooks/useGlobalSuggestedLesson";
import { DesktopLessonLevelsView } from "@/components/learn/DesktopLessonLevelsView";
import ALPHABET_BASE_UNITS from "@/data/alphabet_units.json";
import PathDesktopTimeline from "@/components/path-ui/PathDesktopTimeline";
import PathMobileTimeline from "@/components/path-ui/PathMobileTimeline";
import PathLayout from "@/components/path-ui/PathLayout";

// Imports for inline modals
import dynamic from 'next/dynamic';
const PathLessonModal = dynamic(() => import('@/components/path-ui/PathLessonModal'), { ssr: false });
const UnitsModal = dynamic(() => import('@/components/modals/UnitsModal'), { ssr: false });
const QuestsModal = dynamic(() => import('@/components/modals/QuestsModal'), { ssr: false });
import { getTranslation, getLocalizedField } from "@/hooks/useTranslation";
import { DailyQuestsWidget } from "@/components/widgets/DailyQuestsWidget";
import { ConversationObjectiveWidget } from "@/components/widgets/ConversationObjectiveWidget";
import { LeaderboardWidget } from "@/components/widgets/LeaderboardWidget";

export default function AlphabetClientPage({ lightweightLessons }: { lightweightLessons: any[] }) {
  const { dailyQuests, language } = useProgressStore();
  const alphabetQuests = dailyQuests?.alphabet || [];
  
  const globalSuggested = useGlobalSuggestedLesson(lightweightLessons);
  
  const { consonants, vowels } = useMemo(() => getAlphabetLessons(), []);

  const UNITS = useMemo(() => [
    {
      ...ALPHABET_BASE_UNITS[0],
      lessons: consonants
    },
    {
      ...ALPHABET_BASE_UNITS[1],
      lessons: vowels
    }
  ], [consonants, vowels]);

  const allLessons = useMemo(() => [...consonants, ...vowels], [consonants, vowels]);

  const suggestedLessonId = globalSuggested?.type === 'alphabet' ? globalSuggested.id : null;

  return (
    <PathLayout
      pathType="alphabet"
      units={UNITS}
      lessons={allLessons}
      quests={alphabetQuests}
      globalSuggested={globalSuggested}
      suggestedLessonId={suggestedLessonId}
      maxLevelPerLesson={3}
      renderMobileTimeline={({ key, ...props }: any) => <PathMobileTimeline key={key} {...props} pathType="alphabet" quests={alphabetQuests} maxLevelPerLesson={3} />}
      renderDesktopTimeline={({ key, ...props }: any) => <PathDesktopTimeline key={key} {...props} pathType="alphabet" maxLevelPerLesson={3} />}
      renderLessonLevelsView={(props) => <DesktopLessonLevelsView {...props} suggestionType="alphabet" maxLevelPerLesson={3} />}
      renderLessonModal={(props) => <PathLessonModal {...props} pathType="alphabet" maxLevelPerLesson={3} />}
      renderUnitsModal={(props) => <UnitsModal {...props} />}
      renderQuestsModal={(props) => <QuestsModal category="alphabet" {...props} />}
    />
  );
}
