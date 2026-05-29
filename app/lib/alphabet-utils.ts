import { THAI_ALPHABET, AlphabetItem } from './alphabet-data';
import { Word, Phrase } from '../types';

export function formatCombiningChar(charStr: string): string {
  if (!charStr) return charStr;
  const code = charStr.charCodeAt(0);
  const isCombining = code === 0x0E31 || (code >= 0x0E34 && code <= 0x0E3A) || (code >= 0x0E47 && code <= 0x0E4E);
  
  if (isCombining) {
    if (typeof navigator !== 'undefined') {
      const isApple = /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
      if (isApple) return charStr;
    }
    return '\u25CC' + charStr;
  }
  
  return charStr;
}

export interface AlphabetLessonDef {
  id: string; // 'c-1'
  title: string;
  titleEn: string;
  type: 'consonant' | 'vowel';
  items: AlphabetItem[];
  imageUrl?: string;
}

export function getAlphabetLessons(): { consonants: AlphabetLessonDef[], vowels: AlphabetLessonDef[] } {
  const consonants = THAI_ALPHABET.filter(i => i.type === 'consonant');
  const vowels = THAI_ALPHABET.filter(i => i.type === 'vowel');

  const createLessons = (list: AlphabetItem[], prefix: string, type: 'consonant'|'vowel', labelFr: string, labelEn: string) => {
    const lessons: AlphabetLessonDef[] = [];
    for (let i = 0; i < list.length; i += 3) {
      lessons.push({
        id: `alpha-${prefix}-${Math.floor(i / 3) + 1}`,
        title: `${labelFr} ${Math.floor(i / 3) + 1}`,
        titleEn: `${labelEn} ${Math.floor(i / 3) + 1}`,
        type,
        items: list.slice(i, i + 3),
        imageUrl: '/images/letters.svg'
      });
    }
    return lessons;
  }

  return {
    consonants: createLessons(consonants, 'c', 'consonant', 'Consonnes', 'Consonants'),
    vowels: createLessons(vowels, 'v', 'vowel', 'Voyelles', 'Vowels')
  };
}

export type AlphabetExerciseType = 'intro' | 'word-match' | 'phrase-match' | 'review' | 'phonetic-match' | 'audio-match';

export interface AlphabetExercise {
  id: string;
  type: AlphabetExerciseType;
  item: AlphabetItem;
  options: AlphabetItem[]; // For choices
  targetText: string; // The phrase or word
  targetTranslation: string; // FR/EN translation
  letterToPick: string; // The correct answer
  phonetic: string;
  explanation?: string;
}

export function generateAlphabetExercises(lessonDef: AlphabetLessonDef, level: number, language: string, allWords: Word[], allPhrases: Phrase[]): AlphabetExercise[] {
  const exercises: AlphabetExercise[] = [];
  
  if (level === 0) {
    for (const item of lessonDef.items) {
      // 1. Intro
      exercises.push({
        id: `intro-${item.letter}`,
        type: 'intro',
        item,
        options: [],
        targetText: item.exampleWord,
        targetTranslation: language === 'en' ? (item.exampleTranslationEn || item.exampleTranslation) : item.exampleTranslation,
        letterToPick: item.letter,
        phonetic: item.pronunciation
      });
      
      // 2. Word match (Basic word)
      const distractors = THAI_ALPHABET.filter(i => i.type === item.type && i.letter !== item.letter);
      const distractor1 = distractors[Math.floor(Math.random() * distractors.length)];
      const options = [item, distractor1].sort(() => Math.random() - 0.5);
      
      exercises.push({
         id: `wm-${item.letter}-${Date.now()}`,
         type: 'word-match',
         item,
         options,
         targetText: item.exampleWord,
         targetTranslation: language === 'en' ? (item.exampleTranslationEn || item.exampleTranslation) : item.exampleTranslation,
         letterToPick: item.letter,
         phonetic: item.pronunciation
      });
      
      // 3. Phrase match
      let pool = allWords.filter(w => w.th.includes(item.letter));
      let targetText, targetTranslation, phonetic, explanation;
      
      if (pool.length === 0) {
         targetText = item.exampleWord;
         targetTranslation = language === 'en' ? (item.exampleTranslationEn || item.exampleTranslation) : item.exampleTranslation;
         phonetic = item.pronunciation;
      } else {
         const picked = pool[Math.floor(Math.random() * pool.length)];
         targetText = picked.th;
         targetTranslation = language === 'en' ? (picked.en || picked.fr) : picked.fr;
         phonetic = picked.phonetic;
         explanation = picked.explanation;
      }
      
      exercises.push({
        id: `pm-${item.letter}-${Date.now()}`,
        type: 'phrase-match',
        item,
        options,
        targetText,
        targetTranslation,
        letterToPick: item.letter,
        phonetic,
        explanation
      });
    }
  } else if (level === 1) {
    // Level 2 -> Phonetic match
    const options = [...lessonDef.items].sort(() => Math.random() - 0.5);
    exercises.push({
        id: `review-${Date.now()}`,
        type: 'review',
        item: lessonDef.items[0], // dummy
        options: lessonDef.items, // the 3 to show
        targetText: '',
        targetTranslation: '',
        letterToPick: '',
        phonetic: ''
    });
    
    const pms: AlphabetExercise[] = [];
    for (let j = 0; j < 5; j++) {
      for (const item of lessonDef.items) {
         pms.push({
             id: `phonetic-match-${item.letter}-${j}-${Date.now()}`,
             type: 'phonetic-match',
             item,
             options, // all 3 items from this lesson
             targetText: item.pronunciation,
             targetTranslation: '',
             letterToPick: item.letter,
             phonetic: item.pronunciation
         });
      }
    }
    pms.sort(() => Math.random() - 0.5);
    exercises.push(...pms);
    
  } else if (level === 2) {
    // Level 3 -> Audio match
    const options = [...lessonDef.items].sort(() => Math.random() - 0.5);
    exercises.push({
        id: `review-${Date.now()}`,
        type: 'review',
        item: lessonDef.items[0], // dummy
        options: lessonDef.items, // the 3 to show
        targetText: '',
        targetTranslation: '',
        letterToPick: '',
        phonetic: ''
    });
    
    const pms: AlphabetExercise[] = [];
    for (let j = 0; j < 5; j++) {
      for (const item of lessonDef.items) {
         pms.push({
             id: `audio-match-${item.letter}-${j}-${Date.now()}`,
             type: 'audio-match',
             item,
             options, // all 3 items from this lesson
             targetText: item.exampleWord,
             targetTranslation: '',
             letterToPick: item.letter,
             phonetic: ''
         });
      }
    }
    pms.sort(() => Math.random() - 0.5);
    exercises.push(...pms);

  } else {
    // Level 4+ -> Phrase match with 3 choices from the learned letters
    const options = [...lessonDef.items].sort(() => Math.random() - 0.5);
    
    // Quick review intro
    exercises.push({
        id: `review-${Date.now()}`,
        type: 'review',
        item: lessonDef.items[0], // dummy
        options: lessonDef.items, // the 3 to show
        targetText: '',
        targetTranslation: '',
        letterToPick: '',
        phonetic: ''
    });
    
    const pms: AlphabetExercise[] = [];
    for (const item of lessonDef.items) {
      // 3 exercises per item
      for (let i = 0; i < 3; i++) {
        let pool = allWords.filter(w => w.th.includes(item.letter));
        if (pool.length === 0) pool = allPhrases.filter(p => String(p.th).includes(item.letter)) as any;
        
        let targetText, targetTranslation, phonetic, explanation;
        if (pool.length === 0) {
           targetText = item.exampleWord;
           targetTranslation = language === 'en' ? (item.exampleTranslationEn || item.exampleTranslation) : item.exampleTranslation;
           phonetic = item.pronunciation;
        } else {
           const picked = pool[Math.floor(Math.random() * pool.length)];
           targetText = picked.th;
           targetTranslation = language === 'en' ? (picked.en || picked.fr) : picked.fr;
           phonetic = picked.phonetic;
           explanation = picked.explanation;
        }
           
        pms.push({
           id: `pm-level2-${item.letter}-${i}-${Date.now()}`,
           type: 'phrase-match',
           item,
           options, // all 3 items from this lesson
           targetText,
           targetTranslation,
           letterToPick: item.letter,
           phonetic,
           explanation
        });
      }
    }
    
    // Shuffle the generated PMs
    pms.sort(() => Math.random() - 0.5);
    exercises.push(...pms);
  }
  
  // Prevent consecutive matching exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of exercises) {
    if ((ex.type === 'word-match' || ex.type === 'phonetic-match' || ex.type === 'audio-match') && ex.options && ex.options.length > 1) {
      // The answer is the one that matches ex.item.letter
      let correctIndex = ex.options.findIndex(o => o.letter === ex.item.letter);
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

  return exercises;
}
