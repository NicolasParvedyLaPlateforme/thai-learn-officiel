import { useMemo, useState, useEffect } from 'react';
import { useProgressStore } from './store';
import { getAlphabetLessons } from './alphabet-utils';
import { getLightweightLessons } from '../actions/course';

export type SuggestedLesson = {
  id: string;
  type: 'learn' | 'alphabet';
};

export function useGlobalSuggestedLesson(providedLearnLessons?: any[]): SuggestedLesson | null {
  const { lessonLevels, lastPlayedLessonId, lastPlayedLessonType } = useProgressStore();
  
  const [learnLessons, setLearnLessons] = useState<any[]>(providedLearnLessons || []);

  useEffect(() => {
    if (!providedLearnLessons) {
      getLightweightLessons().then(lessons => {
        setLearnLessons(lessons);
      });
    }
  }, [providedLearnLessons]);
  
  return useMemo(() => {
    if (learnLessons.length === 0) return null;

    let furthestInProgress: SuggestedLesson | null = null;
    let firstZeroLevel: SuggestedLesson | null = null;
    let suggestionFromLastPlayed: SuggestedLesson | null = null;

    const alphabetRaw = getAlphabetLessons();
    const alphabetLessons = [...alphabetRaw.consonants, ...alphabetRaw.vowels].filter(l => Boolean(l));

    if (lastPlayedLessonId && lastPlayedLessonType) {
       const isAlphabet = lastPlayedLessonType === 'alphabet';
       const maxLevel = isAlphabet ? 4 : 10;
       const list = isAlphabet ? alphabetLessons : learnLessons;
       
       const currentIndex = list.findIndex(l => l.id === lastPlayedLessonId);
       if (currentIndex !== -1) {
          const currentLevel = lessonLevels[lastPlayedLessonId] || 0;
          if (currentLevel < maxLevel) {
             suggestionFromLastPlayed = { id: lastPlayedLessonId, type: lastPlayedLessonType };
          } else if (currentIndex + 1 < list.length) {
             suggestionFromLastPlayed = { id: list[currentIndex + 1].id, type: lastPlayedLessonType };
          }
       }
    }

    for (const lesson of learnLessons) {
      if (!lesson) continue;
      const level = lessonLevels[lesson.id] || 0;
      if (level > 0 && level < 10 && !furthestInProgress) {
        furthestInProgress = { id: lesson.id, type: 'learn' };
      }
      if (level === 0 && !firstZeroLevel) {
        firstZeroLevel = { id: lesson.id, type: 'learn' };
      }
    }

    if (!furthestInProgress && !firstZeroLevel) {
       for (const lesson of alphabetLessons) {
         const level = lessonLevels[lesson.id] || 0;
         if (level > 0 && level < 4 && !furthestInProgress) {
           furthestInProgress = { id: lesson.id, type: 'alphabet' };
         }
         if (level === 0 && !firstZeroLevel) {
           firstZeroLevel = { id: lesson.id, type: 'alphabet' };
         }
       }
    }

    return suggestionFromLastPlayed || furthestInProgress || firstZeroLevel || { id: learnLessons[0]?.id || '', type: 'learn' };
  }, [lessonLevels, lastPlayedLessonId, lastPlayedLessonType, learnLessons]);
}
