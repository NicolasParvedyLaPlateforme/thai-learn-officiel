import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { buildWriting, buildFreeTyping, buildWordMatch } from '../builders';

export function generateLevel7(validLessonWords: Word[], language: string): Exercise[] {
  let wrPool: Exercise[] = [];
  validLessonWords.forEach(w => {
    wrPool.push(buildWriting(w, language, { blindMode: true, hideRomanization: true }));
  });
  return shuffle(wrPool);
}

export function generateLevel8(validLessonWords: Word[], lessonPhrases: Phrase[], language: string): Exercise[] {
  let wrPool: Exercise[] = [];
  lessonPhrases.forEach(p => {
    wrPool.push(buildWriting(p, language, { blindMode: true, hideRomanization: true }));
  });
  
  if (wrPool.length === 0) {
     validLessonWords.forEach(w => {
       wrPool.push(buildWriting(w, language, { blindMode: true, hideRomanization: true }));
     });
  }
  return shuffle(wrPool);
}

export function generateLevel9(validLessonWords: Word[], lessonPhrases: Phrase[], language: string, totalParts: number | null): Exercise[] {
  let ftPool: Exercise[] = [];
  
  validLessonWords.forEach(w => {
    ftPool.push(buildFreeTyping(w, language, { hideRomanization: true }));
  });

  let ftPhrases: Exercise[] = [];
  lessonPhrases.forEach(p => {
    ftPhrases.push(buildFreeTyping(p, language, { hideRomanization: true }));
  });

  let combinedPool = [...shuffle(ftPool), ...shuffle(ftPhrases)];
  
  let limit = 10;
  if (totalParts !== null && totalParts > 1) {
      limit = Math.max(1, Math.ceil(10 / totalParts));
  }
  
  while (combinedPool.length < limit && combinedPool.length > 0) {
    combinedPool = [...combinedPool, ...shuffle(combinedPool)];
  }
  
  return combinedPool.slice(0, limit);
}
