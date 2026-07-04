import { Exercise, Word, Phrase } from "@/types";
import { shuffle, getRandomDistractorMode } from '../utils';
import { 
  buildWordMatch, 
  buildFillInTheBlank, 
  buildOneLetterDifference, 
  buildWordPosition, 
  buildPhraseOrder,
  buildMissingLetter,
  buildSoundToLetter,
  buildTrueFalseSpelling,
  buildIntro,
  buildComposition
} from '../builders';

export function generateLevel1(validLessonWords: Word[], lessonPhrases: Phrase[], globalWords: Word[], language: string): Exercise[] {
  let wmExercises: Exercise[] = [];
  
  validLessonWords.forEach(word => {
    let pool: Exercise[] = [];

    const missingLetterEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (missingLetterEx) pool.push(missingLetterEx);
    
    const missingLetterVowelEx = buildMissingLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (missingLetterVowelEx) pool.push(missingLetterVowelEx);
    
    const soundToLetterVowelEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'vowel' });
    if (soundToLetterVowelEx) pool.push(soundToLetterVowelEx);
    
    const soundToLetterConsonantEx = buildSoundToLetter(word, language, { numDistractors: 1, targetType: 'consonant' });
    if (soundToLetterConsonantEx) pool.push(soundToLetterConsonantEx);
    
    const tfModes = ['random-replace', 'misplaced-consonant', 'misplaced-vowel', 'similar-consonant', 'similar-vowel'] as const;
    const selectedTfMode = tfModes[Math.floor(Math.random() * tfModes.length)];
    pool.push(buildTrueFalseSpelling(word, language, { mode: selectedTfMode }));

    for (let i = 0; i < 2; i++) {
      pool.push(buildWordMatch(word, language, {
        distractorMode: getRandomDistractorMode(),
        numDistractors: 3,
        maxMistakes: 2,
        validLessonWords,
        pool: globalWords
      }));
    }
    
    const hintTypes: Array<'sound' | 'image' | 'pronunciation'> = ['sound', 'image', 'pronunciation'];
    hintTypes.forEach(hintType => {
      const ex = buildOneLetterDifference(word, language, {
        hintType,
        numDistractors: 3,
        maxMistakes: 2,
        pool: globalWords
      });
      if (ex) pool.push(ex);
    });

    pool = shuffle(pool);
    wmExercises.push(...pool.slice(0, 2));
  });

  wmExercises = shuffle(wmExercises);

  // Prevent consecutive same answers for wmExercises
  const result: Exercise[] = [];
  const waitlist: Exercise[] = [];
  
  for (let i = 0; i < wmExercises.length; i++) {
     const current = wmExercises[i];
     const lastInResult = result[result.length - 1];
     
     if (!lastInResult || lastInResult.answer !== current.answer) {
         result.push(current);
         let w = 0;
         while (w < waitlist.length) {
            if (result[result.length - 1].answer !== waitlist[w].answer) {
                result.push(waitlist.splice(w, 1)[0]);
            } else {
                w++;
            }
         }
     } else {
         waitlist.push(current);
     }
  }
  wmExercises = [...result, ...waitlist];

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

  const finalExercises = [...wmExercises, ...phraseExercises];

  // Prevent consecutive word-match exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of finalExercises) {
    if (ex.type === 'word-match' && !(ex as any).isFillInBlank && ex.options && ex.options.length > 1) {
      let correctIndex = ex.options.findIndex((o: any) => o.th === ex.answer);
      if (correctIndex !== -1) {
        if (correctIndex === lastCorrectIndex) {
          let newIdx;
          do {
            newIdx = Math.floor(Math.random() * ex.options.length);
          } while (newIdx === correctIndex);
          const newOptions = [...ex.options];
          [newOptions[correctIndex], newOptions[newIdx]] = [newOptions[newIdx], newOptions[correctIndex]];
          ex.options = newOptions;
          correctIndex = newIdx;
        }
        lastCorrectIndex = correctIndex;
      }
    }
  }

  return finalExercises;
}
