import { Lesson, Exercise } from "@/types";
import { shuffle } from './utils';
import { getTranslation } from '@/hooks/useTranslation';

export function generateEndlessPairMatching(
  allLessons: Lesson[],
  completedLessonIds: string[],
  language: string = 'fr'
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];
  const globalItemsRaw = completedLessons.flatMap(l => [...l.words.filter(w => w.id !== 'w_dots'), ...l.phrases]);
  const globalItems = Array.from(new Map(globalItemsRaw.map(w => [w.id, w])).values());
  if (globalItems.length < 4) return [];

  let exercises: Exercise[] = [];
  for (let i = 0; i < 20; i++) {
    const selectedPairs = shuffle(globalItems).slice(0, 4);
    
    // Pick a random mode for review
    const modeRoll = Math.random();
    let mode: 'normal' | 'audio-only' | 'script-only' = 'normal';
    if (modeRoll < 0.33) {
      mode = 'audio-only';
    } else if (modeRoll < 0.66) {
      mode = 'script-only';
    }

    exercises.push({
      id: `endless-pm-${Date.now()}-${Math.random()}`,
      type: 'pair-matching',
      question: getTranslation('exercise.match_pairs', language),
      answer: '',
      options: selectedPairs as any,
      pairs: selectedPairs as any,
      hideHints: true,
      pairMatchMode: mode
    });
  }
  return exercises;
}
