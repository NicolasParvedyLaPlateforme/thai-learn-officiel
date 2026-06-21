import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { buildFillInTheBlank, buildSentenceBuilder, buildPhraseMatch, buildWordMatch } from '../builders';

export function generateLevel3(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], allPhrases: Phrase[], language: string, totalParts: number | null): Exercise[] {
  let fillInBlankPool: Exercise[] = [];
  lessonPhrases.forEach((phrase) => {
    const fibEx = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 1,
       pool: globalWords
    });
    if (fibEx) fillInBlankPool.push(fibEx);
  });

  let sbPool: Exercise[] = [];
  lessonPhrases.forEach(phrase => {
    sbPool.push(buildSentenceBuilder(phrase, language, {
      numDistractors: 1,
      pool: globalWords
    }));
  });

  let phraseMatchPool: Exercise[] = [];
  lessonPhrases.forEach(phrase => {
    phraseMatchPool.push(buildPhraseMatch(phrase, language, {
       maxMistakes: 1,
       allPhrases
    }));
  });

  let limit = 15;
  if (totalParts !== null && totalParts > 1) {
      limit = Math.max(1, Math.ceil(15 / totalParts));
  }

  let mixedPool = shuffle([...fillInBlankPool, ...sbPool, ...phraseMatchPool]);
  while (mixedPool.length < limit && mixedPool.length > 0) {
    mixedPool = [...mixedPool, ...shuffle(mixedPool)];
  }
  
  if (mixedPool.length === 0) {
    // Fallback to word match if no phrases
    validLessonWords.forEach(word => {
      mixedPool.push(buildWordMatch(word, language, {
        distractorMode: 'random',
        numDistractors: 3,
        pool: globalWords
      }));
    });
    mixedPool = shuffle(mixedPool);
  }
  
  return mixedPool.slice(0, limit).map((ex, i) => ({
    ...ex,
    forceHideRomanization: i >= Math.floor(mixedPool.length / 2)
  }));
}
