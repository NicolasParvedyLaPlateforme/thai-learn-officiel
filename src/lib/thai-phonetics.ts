import { ToneClass, ToneResult } from "@/types/alphabet";

export type MataFamily = 
  | "Mae Ko Ka" // No final consonant
  | "Mae Kok"  // K sound
  | "Mae Kot"  // T sound
  | "Mae Kop"  // P sound
  | "Mae Kong" // Ng sound
  | "Mae Kan"  // N sound
  | "Mae Kom"  // M sound
  | "Mae Koei" // Y sound
  | "Mae Kow"; // W sound

export type SyllableType = "live" | "dead";
export type VowelLength = "short" | "long";

/**
 * Identify the final consonant family (Mata)
 */
export const getFinalConsonantFamily = (char: string): MataFamily => {
  if (['ก', 'ข', 'ค', 'ฆ'].includes(char)) return "Mae Kok";
  if (['จ', 'ด', 'ต', 'ถ', 'ท', 'ธ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ช', 'ซ', 'ศ', 'ษ', 'ส'].includes(char)) return "Mae Kot";
  if (['บ', 'ป', 'พ', 'ฟ', 'ภ'].includes(char)) return "Mae Kop";
  if (['ง'].includes(char)) return "Mae Kong";
  if (['น', 'ณ', 'ญ', 'ร', 'ล', 'ฬ'].includes(char)) return "Mae Kan";
  if (['ม'].includes(char)) return "Mae Kom";
  if (['ย'].includes(char)) return "Mae Koei";
  if (['ว'].includes(char)) return "Mae Kow";
  
  return "Mae Ko Ka";
};

/**
 * Returns the phonetic sound (IPA/Romanization) of the final consonant
 */
export const getFinalConsonantSound = (family: MataFamily): string => {
  switch (family) {
    case "Mae Kok": return "K";
    case "Mae Kot": return "T";
    case "Mae Kop": return "P";
    case "Mae Kong": return "NG";
    case "Mae Kan": return "N";
    case "Mae Kom": return "M";
    case "Mae Koei": return "Y";
    case "Mae Kow": return "W";
    default: return "";
  }
};

/**
 * Determines if a vowel character is strictly short
 */
export const isShortVowel = (char: string): boolean => {
  return ['ะ', 'ิ', 'ึ', 'ุ', 'ั', '็'].includes(char);
};

/**
 * Determine if a syllable is Live (Kham Pen) or Dead (Kham Taay)
 */
export const getSyllableType = (family: MataFamily, isShort: boolean): SyllableType => {
  // Syllables ending in K, T, P are ALWAYS Dead.
  if (['Mae Kok', 'Mae Kot', 'Mae Kop'].includes(family)) {
    return "dead";
  }
  // Syllables ending in Sonorants (Ng, N, M, Y, W) are ALWAYS Live.
  if (['Mae Kong', 'Mae Kan', 'Mae Kom', 'Mae Koei', 'Mae Kow'].includes(family)) {
    return "live";
  }
  // Mae Ko Ka (No final consonant): depends on vowel length
  return isShort ? "dead" : "live";
};

/**
 * Calculate the tone of a syllable with NO tone marks
 * based on Class, Live/Dead, and Vowel length.
 */
export const calculateImplicitTone = (
  initialClass: ToneClass, 
  syllableType: SyllableType, 
  isShort: boolean
): ToneResult => {
  if (initialClass === 'high') {
    return syllableType === 'live' ? 'rising' : 'low';
  }
  
  if (initialClass === 'mid') {
    return syllableType === 'live' ? 'mid' : 'low';
  }
  
  if (initialClass === 'low') {
    if (syllableType === 'live') return 'mid';
    // Dead syllable for Low class depends on vowel length
    return isShort ? 'high' : 'falling';
  }
  
  return 'mid'; // Fallback
};

/**
 * Helper to analyze a simplified syllable structure given surrounding characters.
 * This is an heuristic algorithm designed for the Composition UI.
 */
export const analyzeSyllableContext = (
  characters: string[], 
  currentIndex: number, 
  activeAlphabetItem: any
) => {
  let initialConsonant = null;
  let initialClass: ToneClass = 'mid';
  let hasShortVowel = false;
  let finalConsonant = null;
  let finalFamily: MataFamily = "Mae Ko Ka";
  let toneMark = null;

  // 1. Identify the role of the current character
  const isVowel = activeAlphabetItem?.type === 'vowel';
  const isConsonant = activeAlphabetItem?.type === 'consonant';

  // Find previous consonant (Initial)
  for (let i = currentIndex - 1; i >= 0; i--) {
    const char = characters[i];
    // We assume the first consonant we hit looking backwards is the initial.
    // (This is a simplified heuristic, it might pick a leading consonant)
    if (/[ก-ฮ]/.test(char)) {
      initialConsonant = char;
      break;
    }
  }
  
  // Also check for 'Leading Consonant' (Akson Nam) like ห or a high class consonant
  let leadingConsonantClass: ToneClass | null = null;
  if (initialConsonant) {
    const initIdx = characters.indexOf(initialConsonant);
    if (initIdx > 0 && /[ก-ฮ]/.test(characters[initIdx - 1])) {
       // Potential leading consonant
       const potentialLeader = characters[initIdx - 1];
       if (potentialLeader === 'ห' || potentialLeader === 'อ') {
         leadingConsonantClass = potentialLeader === 'ห' ? 'high' : 'mid';
       } else {
         // High/Mid class can lead Low sonorant class (simplified logic)
         // Actually evaluating full Akson Nam requires dictionary, we skip strict evaluation here 
         // and just look if there's a ห.
       }
    }
  }

  // 2. Identify Vowels & Vowel Length in the syllable block
  // We scan a small window around the initial consonant up to the current index
  const windowStart = initialConsonant ? characters.indexOf(initialConsonant) : Math.max(0, currentIndex - 2);
  for (let i = windowStart; i <= currentIndex + 1; i++) {
    if (characters[i] && isShortVowel(characters[i])) {
      hasShortVowel = true;
    }
  }

  // 3. Identify Final Consonant
  // If the user clicked on a consonant, is it the final one?
  let finalConsonantIndex = -1;
  if (isConsonant) {
    // A consonant is final if it's the last character, or followed by another syllable's initial/vowel
    // For heuristic: if the previous char is a vowel (ั, ิ, etc.) or we are at the end
    const prevChar = currentIndex > 0 ? characters[currentIndex - 1] : null;
    if (prevChar && (isShortVowel(prevChar) || /[\u0E30-\u0E39\u0E40-\u0E44]/.test(prevChar))) {
       finalConsonant = characters[currentIndex];
       finalConsonantIndex = currentIndex;
    }
    // Also if it's the very last char in the word
    if (currentIndex === characters.length - 1 && initialConsonant !== characters[currentIndex]) {
       finalConsonant = characters[currentIndex];
       finalConsonantIndex = currentIndex;
    }
  } else {
    // If user clicked a vowel (like ั), the final consonant is likely the next consonant
    if (currentIndex + 1 < characters.length && /[ก-ฮ]/.test(characters[currentIndex + 1])) {
      finalConsonant = characters[currentIndex + 1];
      finalConsonantIndex = currentIndex + 1;
    }
  }

  if (finalConsonant) {
    finalFamily = getFinalConsonantFamily(finalConsonant);
  }

  const syllableType = getSyllableType(finalFamily, hasShortVowel);

  return {
    initialConsonant,
    leadingConsonantClass,
    hasShortVowel,
    finalConsonant,
    finalConsonantIndex,
    finalFamily,
    syllableType
  };
};
