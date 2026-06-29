import { Exercise, Word } from "@/types";
import { SIMILAR_CONSONANTS, SIMILAR_VOWELS, THAI_ALPHABET } from "@/data/alphabet-data";
import { getExerciseTranslation } from '@/lib/translation-utils';

export interface TrueFalseConfig {
  mode: 'random-replace' | 'misplaced-consonant' | 'misplaced-vowel' | 'similar-consonant' | 'similar-vowel';
  replaceCount?: { consonant?: number, vowel?: number };
}

const isConsonant = (char: string) => char.charCodeAt(0) >= 0x0E01 && char.charCodeAt(0) <= 0x0E2E;
const isVowel = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x0E40 && code <= 0x0E44) || 
         (code === 0x0E30 || code === 0x0E32 || code === 0x0E33 || code === 0x0E45) ||
         (code >= 0x0E34 && code <= 0x0E39) ||
         (code === 0x0E31 || code === 0x0E47);
};

const allConsonants = THAI_ALPHABET.filter(a => a.type === 'consonant').map(a => a.letter);
const allVowels = THAI_ALPHABET.filter(a => a.type === 'vowel').map(a => a.letter);

export function buildTrueFalseSpelling(word: Word, language: string, config: TrueFalseConfig): Exercise {
  const isCorrectSpelling = Math.random() < 0.5;
  let displayWord = word.th;

  if (!isCorrectSpelling) {
    let chars = Array.from(displayWord);
    const consonantIndices = chars.map((c, i) => isConsonant(c) ? i : -1).filter(i => i !== -1);
    const vowelIndices = chars.map((c, i) => isVowel(c) ? i : -1).filter(i => i !== -1);

    const swap = (arr: string[], i: number, j: number) => {
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    };

    if (config.mode === 'random-replace') {
      let cCount = config.replaceCount?.consonant || 2;
      let vCount = config.replaceCount?.vowel || 1;

      // shuffle indices to replace
      const cIdxToReplace = [...consonantIndices].sort(() => Math.random() - 0.5).slice(0, cCount);
      const vIdxToReplace = [...vowelIndices].sort(() => Math.random() - 0.5).slice(0, vCount);

      cIdxToReplace.forEach(idx => {
        let rc = allConsonants[Math.floor(Math.random() * allConsonants.length)];
        while (rc === chars[idx]) rc = allConsonants[Math.floor(Math.random() * allConsonants.length)];
        chars[idx] = rc;
      });

      vIdxToReplace.forEach(idx => {
        let rv = allVowels[Math.floor(Math.random() * allVowels.length)];
        while (rv === chars[idx]) rv = allVowels[Math.floor(Math.random() * allVowels.length)];
        chars[idx] = rv;
      });
      displayWord = chars.join('');

    } else if (config.mode === 'misplaced-consonant') {
      if (consonantIndices.length >= 2) {
        // Swap two consonants
        const shuffled = [...consonantIndices].sort(() => Math.random() - 0.5);
        swap(chars, shuffled[0], shuffled[1]);
        displayWord = chars.join('');
      } else if (consonantIndices.length === 1 && vowelIndices.length >= 1) {
        // Swap with a vowel if only 1 consonant
        swap(chars, consonantIndices[0], vowelIndices[0]);
        displayWord = chars.join('');
      } else if (chars.length >= 2) {
        // Just swap first two
        swap(chars, 0, 1);
        displayWord = chars.join('');
      }
    } else if (config.mode === 'misplaced-vowel') {
      if (vowelIndices.length >= 2) {
        const shuffled = [...vowelIndices].sort(() => Math.random() - 0.5);
        swap(chars, shuffled[0], shuffled[1]);
        displayWord = chars.join('');
      } else if (vowelIndices.length === 1 && consonantIndices.length >= 1) {
        swap(chars, vowelIndices[0], consonantIndices[0]);
        displayWord = chars.join('');
      } else if (chars.length >= 2) {
        swap(chars, 0, 1);
        displayWord = chars.join('');
      }
    } else if (config.mode === 'similar-consonant') {
      if (consonantIndices.length > 0) {
        // try to find a consonant that has a similar one
        const shuffledIndices = [...consonantIndices].sort(() => Math.random() - 0.5);
        let replaced = false;
        for (const idx of shuffledIndices) {
          const c = chars[idx];
          const similarGroup = SIMILAR_CONSONANTS.find(g => g.includes(c));
          if (similarGroup) {
            const others = similarGroup.filter(x => x !== c);
            chars[idx] = others[Math.floor(Math.random() * others.length)];
            replaced = true;
            break;
          }
        }
        if (!replaced) {
          // fallback random
          let rc = allConsonants[Math.floor(Math.random() * allConsonants.length)];
          chars[shuffledIndices[0]] = rc;
        }
        displayWord = chars.join('');
      }
    } else if (config.mode === 'similar-vowel') {
      if (vowelIndices.length > 0) {
        const shuffledIndices = [...vowelIndices].sort(() => Math.random() - 0.5);
        let replaced = false;
        for (const idx of shuffledIndices) {
          const v = chars[idx];
          const similarGroup = SIMILAR_VOWELS.find(g => g.includes(v));
          if (similarGroup) {
            const others = similarGroup.filter(x => x !== v);
            chars[idx] = others[Math.floor(Math.random() * others.length)];
            replaced = true;
            break;
          }
        }
        if (!replaced) {
          // fallback random
          let rv = allVowels[Math.floor(Math.random() * allVowels.length)];
          chars[shuffledIndices[0]] = rv;
        }
        displayWord = chars.join('');
      }
    }
    
    // If somehow we failed to mess it up (e.g. no vowels or consonants), force it
    if (displayWord === word.th) {
      if (chars.length >= 2) {
        const temp = chars[0];
        chars[0] = chars[chars.length - 1];
        chars[chars.length - 1] = temp;
        displayWord = chars.join('');
      }
      // if it's still same, it means it was a palindrome or single char.
      if (displayWord === word.th) {
        displayWord = word.th + allConsonants[Math.floor(Math.random() * allConsonants.length)];
      }
    }
  }

  return {
    id: `true-false-${word.id}-${Date.now()}`,
    type: 'true-false',
    question: `auto.exercise.trueFalse`,
    answer: isCorrectSpelling ? 'true' : 'false',
    options: [],
    originalWord: word.th,
    displayWord,
    isCorrectSpelling,
    phonetic: word.phonetic,
    translation: getExerciseTranslation(word, language)
  };
}
