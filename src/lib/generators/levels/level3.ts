import { Exercise, Word, Phrase } from "@/types";
import { shuffle } from '../utils';
import { 
  buildFillInTheBlank, 
  buildSentenceBuilder, 
  buildPhraseOrder,
  buildWordPosition
} from '../builders';

export function generateLevel3(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], allPhrases: Phrase[], language: string, totalParts: number | null): Exercise[] {
  let phraseExercises: Exercise[] = [];
  
  shuffle([...lessonPhrases]).forEach((phrase) => {
    let phraseSequence: Exercise[] = [];
    
    const fibExMain = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords,
       mode: 'classic'
    });
    if (fibExMain) phraseSequence.push(fibExMain);

    let randomPool: Exercise[] = [];
    
    const poEx = buildPhraseOrder(phrase, language, { pool: globalWords });
    if (poEx) randomPool.push(poEx);

    const wpEx = buildWordPosition(phrase, language, { pool: globalWords });
    if (wpEx) randomPool.push(wpEx);

    const fibExTrans = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords,
       mode: 'translation'
    });
    if (fibExTrans) randomPool.push(fibExTrans);

    const fibExAudio = buildFillInTheBlank(phrase, language, {
       numMisspelledDistractors: 1,
       maxMistakes: 2,
       pool: globalWords,
       mode: 'audio'
    });
    if (fibExAudio) randomPool.push(fibExAudio);

    randomPool = shuffle(randomPool);
    phraseSequence.push(...randomPool.slice(0, 3));
    
    const sbEx = buildSentenceBuilder(phrase, language, {
      numDistractors: 0,
      pool: globalWords
    });
    if (sbEx) phraseSequence.push(sbEx);
    
    phraseExercises.push(...phraseSequence);
  });

  return phraseExercises;
}
