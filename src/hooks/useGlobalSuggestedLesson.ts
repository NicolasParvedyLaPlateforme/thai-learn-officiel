import { useMemo, useState, useEffect } from 'react';
import { useProgressStore } from '@/lib/store';
import { getAlphabetLessons } from '@/lib/alphabet-utils';
import { getLightweightLessons } from "@/actions/course";

export type SuggestedLesson = {
  id: string;
  type: 'learn' | 'alphabet' | 'speak';
};

export function useGlobalSuggestedLesson(providedLearnLessons?: any[]): SuggestedLesson | null {
  const { lessonLevels, fullLevelsCompleted, lastPlayedLessonId, lastPlayedLessonType } = useProgressStore();
  
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
          const isComplete = currentLevel >= maxLevel || (fullLevelsCompleted[lastPlayedLessonId] || []).includes(maxLevel - 1);
          if (!isComplete) {
             suggestionFromLastPlayed = { id: lastPlayedLessonId, type: lastPlayedLessonType };
          } else {
             // Find the next incomplete lesson starting from currentIndex + 1
             for (let i = currentIndex + 1; i < list.length; i++) {
                const nextLessonId = list[i].id;
                const nextLessonLevel = lessonLevels[nextLessonId] || 0;
                const nextIsComplete = nextLessonLevel >= maxLevel || (fullLevelsCompleted[nextLessonId] || []).includes(maxLevel - 1);
                if (!nextIsComplete) {
                   suggestionFromLastPlayed = { id: nextLessonId, type: lastPlayedLessonType };
                   break;
                }
             }
          }
       }
    }

    for (const lesson of learnLessons) {
      if (!lesson) continue;
      const level = lessonLevels[lesson.id] || 0;
      const isComplete = level >= 10 || (fullLevelsCompleted[lesson.id] || []).includes(9);
      if (level > 0 && !isComplete && !furthestInProgress) {
        furthestInProgress = { id: lesson.id, type: 'learn' };
      }
      if (level === 0 && !firstZeroLevel) {
        firstZeroLevel = { id: lesson.id, type: 'learn' };
      }
    }

    if (!furthestInProgress && !firstZeroLevel) {
       for (const lesson of alphabetLessons) {
         const level = lessonLevels[lesson.id] || 0;
         const isComplete = level >= 4 || (fullLevelsCompleted[lesson.id] || []).includes(3);
         if (level > 0 && !isComplete && !furthestInProgress) {
           furthestInProgress = { id: lesson.id, type: 'alphabet' };
         }
         if (level === 0 && !firstZeroLevel) {
           firstZeroLevel = { id: lesson.id, type: 'alphabet' };
         }
       }
    }

    return suggestionFromLastPlayed || furthestInProgress || firstZeroLevel || { id: learnLessons[0]?.id || '', type: 'learn' };
  }, [lessonLevels, fullLevelsCompleted, lastPlayedLessonId, lastPlayedLessonType, learnLessons]);
}
