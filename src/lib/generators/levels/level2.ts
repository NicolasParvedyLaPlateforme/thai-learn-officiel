import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { 
  buildFillInTheBlank, 
  buildWordPosition, 
  buildPhraseOrder,
  buildIntro,
  buildComposition
} from '../builders';

export function generateLevel2(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let phraseExercises: Exercise[] = [];
  
  shuffle([...lessonPhrases]).forEach((phrase) => {
    phraseExercises.push(buildIntro(phrase, language));
    phraseExercises.push(buildComposition(phrase, language));
    
    const fibExMain = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords,
       mode: 'classic'
    });
    if (fibExMain) phraseExercises.push(fibExMain);

    let randomPool: Exercise[] = [];
    
    const poEx = buildPhraseOrder(phrase, language, { pool: globalWords });
    if (poEx) randomPool.push(poEx);

    const wpEx = buildWordPosition(phrase, language, { pool: globalWords });
    if (wpEx) randomPool.push(wpEx);

    // Randomly choose between translation or audio mode for the second fill-in-the-blank
    const randomMode = Math.random() < 0.5 ? 'translation' : 'audio';
    const fibExRandom = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords,
       mode: randomMode
    });
    if (fibExRandom) randomPool.push(fibExRandom);

    randomPool = shuffle(randomPool);
    phraseExercises.push(...randomPool);
  });

  return phraseExercises;
}
