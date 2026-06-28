import { Exercise, Word } from "@/types";
import { THAI_ALPHABET } from "@/data/alphabet-data";
import { shuffle } from '../utils';

export interface SoundToLetterOptions {
  numDistractors: number;
  targetType?: 'consonant' | 'vowel';
}

export function buildSoundToLetter(
  word: Word,
  language: string,
  options: SoundToLetterOptions
): Exercise | null {
  const { numDistractors, targetType = 'vowel' } = options;
  
  const candidates = THAI_ALPHABET.filter(i => i.type === targetType);
  const availableInWord = candidates.filter(c => word.th.includes(c.letter));
  
  if (availableInWord.length === 0) return null;
  
  const targetChar = availableInWord[Math.floor(Math.random() * availableInWord.length)];
  
  let possibleDistractors = candidates.filter(c => c.letter !== targetChar.letter);
  possibleDistractors = shuffle(possibleDistractors).slice(0, numDistractors);
  
  const finalOptions = shuffle([
    { id: targetChar.letter, th: targetChar.letter, fr: '', phonetic: targetChar.pronunciation },
    ...possibleDistractors.map(d => ({ id: d.letter, th: d.letter, fr: '', phonetic: d.pronunciation }))
  ]);

  let targetSound = targetChar.pronunciation;
  if (targetSound.startsWith('sara ')) {
    targetSound = targetSound.replace('sara ', '');
  }

  let question = `Dans le mot ${word.th}, quelle lettre produit le son « ${targetSound} » ?`;
  if (language === 'en') {
    question = `In the word ${word.th}, which letter produces the sound "${targetSound}"?`;
  } else if (language === 'es') {
    question = `En la palabra ${word.th}, ¿qué letra produce el sonido "${targetSound}"?`;
  } else if (language === 'de') {
    question = `In dem Wort ${word.th}, welcher Buchstabe macht das Geräusch "${targetSound}"?`;
  } else if (language === 'it') {
    question = `Nella parola ${word.th}, quale lettera produce il suono "${targetSound}"?`;
  }
  
  return {
    id: `sound-to-letter-${word.id}-${Date.now()}-${Math.random()}`,
    type: 'sound-to-letter',
    question,
    answer: targetChar.letter,
    options: finalOptions,
    originalWord: word.th,
    targetSound,
    targetLetter: targetChar.letter,
    targetLetterPhonetic: targetChar.pronunciation,
    imageUrl: word.imageUrl,
    maxMistakes: 1
  };
}
