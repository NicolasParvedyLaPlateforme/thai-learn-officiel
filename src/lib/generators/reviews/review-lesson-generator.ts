import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { buildWordMatch, buildFillInTheBlank, buildSentenceBuilder, buildPhraseMatch, buildPairMatching, buildWriting, buildFreeTyping } from '../builders';

export function generateReviewLesson(
  unitWords: Word[], 
  unitPhrases: Phrase[], 
  allPhrases: Phrase[], 
  globalWords: Word[], 
  language: string, 
  level: number, 
  totalParts: number | null
): Exercise[] {
  let reviewExercises: Exercise[] = [];
  
  if (level === 9) {
      let limit = 10;
      if (totalParts !== null && totalParts > 1) {
          limit = Math.max(1, Math.ceil(10 / totalParts));
      }
      const itemsForFT = shuffle([...unitPhrases, ...unitWords]).slice(0, limit);
      itemsForFT.forEach(item => {
          reviewExercises.push(buildFreeTyping(item, language, { hideRomanization: true, disableTooltips: true }));
      });
      return reviewExercises;
  }

  let limit5 = 5;
  let limit3 = 3;
  if (totalParts !== null && totalParts > 1) {
      limit5 = Math.max(1, Math.ceil(5 / totalParts));
      limit3 = Math.max(1, Math.ceil(3 / totalParts));
  }

  if (level >= 0 && level <= 8) {
      const wordsForWM = shuffle(unitWords).slice(0, limit5);
      wordsForWM.forEach(word => {
          const rand = Math.random();
          let type: 'random' | 'reverse' = rand < 0.5 ? 'random' : 'reverse';
          
          reviewExercises.push(buildWordMatch(word, language, {
            distractorMode: type,
            numDistractors: 3,
            maxMistakes: 2,
            validLessonWords: unitWords,
            pool: globalWords,
            hideHints: true,
            disableTooltips: true
          }));
      });
  }

  if (level >= 1 && level <= 8) {
      const phrasesForFIB = shuffle(unitPhrases).filter(p => p.components.length > 1).slice(0, limit5);
      phrasesForFIB.forEach(phrase => {
         const fibEx = buildFillInTheBlank(phrase, language, {
           numMisspelledDistractors: 1,
           maxMistakes: 2,
           pool: globalWords,
           hideHints: true,
           disableTooltips: true
         });
         if (fibEx) reviewExercises.push(fibEx);
      });
  }

  if (level >= 2 && level <= 8) {
      const phrasesForSB = shuffle(unitPhrases).slice(0, limit5);
      phrasesForSB.forEach(phrase => {
          reviewExercises.push(buildSentenceBuilder(phrase, language, {
            numDistractors: 1,
            pool: globalWords,
            hideHints: true,
            disableTooltips: true
          }));
      });
  }

  if (level >= 3 && level <= 8) {
      const phrasesForTransl = shuffle(unitPhrases).slice(0, limit5);
      phrasesForTransl.forEach(phrase => {
         reviewExercises.push(buildPhraseMatch(phrase, language, {
           maxMistakes: 1,
           allPhrases,
           hideHints: true,
           disableTooltips: true
         }));
      });
  }

  const allItemsForPairs = Array.from(new Map([...unitWords, ...unitPhrases].map(w => [w.id, w])).values());

  if (level >= 4 && level <= 8) {
      for (let i = 0; i < limit3; i++) {
          reviewExercises.push(buildPairMatching({
            mode: 'normal',
            pool: allItemsForPairs,
            language
          }));
      }
  }

  if (level >= 5 && level <= 8) {
      for (let i = 0; i < limit3; i++) {
          reviewExercises.push(buildPairMatching({
            mode: 'audio-only',
            pool: allItemsForPairs,
            language
          }));
      }
  }

  if (level >= 6 && level <= 8) {
      for (let i = 0; i < limit3; i++) {
          reviewExercises.push(buildPairMatching({
            mode: 'script-only',
            pool: allItemsForPairs,
            language
          }));
      }
  }

  if (level >= 7 && level <= 8) {
      const wordsForWr = shuffle(unitWords).slice(0, limit3);
      wordsForWr.forEach(w => {
         reviewExercises.push(buildWriting(w, language, {
           blindMode: true,
           hideRomanization: true,
           hideHints: true,
           disableTooltips: true
         }));
      });
  }

  if (level >= 8 && level <= 8) {
      const phrasesForWr = shuffle(unitPhrases).slice(0, limit3);
      phrasesForWr.forEach(p => {
         reviewExercises.push(buildWriting(p, language, {
           blindMode: true,
           hideRomanization: true,
           hideHints: true,
           disableTooltips: true
         }));
      });
  }

  return reviewExercises;
}
