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
 * Detect implicit vowel type based on consecutive consonants
 */
export const getImplicitVowelType = (charIndex: number, characters: string[]): 'a' | 'o' | null => {
  const char = characters[charIndex];
  if (!/[ก-ฮ]/.test(char)) return null;

  let start = charIndex;
  while (start > 0 && /[ก-ฮ]/.test(characters[start - 1])) {
    start--;
  }
  let end = charIndex;
  while (end < characters.length - 1 && /[ก-ฮ]/.test(characters[end + 1])) {
    end++;
  }
  
  const blockLength = end - start + 1;
  
  if (blockLength === 3) {
    if (charIndex === start) {
      return 'a'; // First consonant of 3 takes 'a'
    } else {
      return 'o'; // The rest takes 'o'
    }
  } else if (blockLength === 2) {
    return 'o'; // e.g. ผม
  }
  
  return null;
}

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
  let initialConsonantIndex = -1;
  let initialClass: ToneClass = 'mid';
  let hasShortVowel = false;
  let finalConsonant = null;
  let finalFamily: MataFamily = "Mae Ko Ka";
  let toneMark = null;

  // 1. Identify the role of the current character
  const isVowel = activeAlphabetItem?.type === 'vowel';
  const isConsonant = activeAlphabetItem?.type === 'consonant';

  let isFinal = false;
  if (isConsonant) {
    const nextChar = currentIndex < characters.length - 1 ? characters[currentIndex + 1] : null;
    const prevChar = currentIndex > 0 ? characters[currentIndex - 1] : null;

    if (currentIndex > 0) {
      if (currentIndex === characters.length - 1) {
        isFinal = true;
      } else {
        if (prevChar && /[\u0E40-\u0E44]/.test(prevChar)) {
          isFinal = false;
        } else if (nextChar && /[\u0E30-\u0E39\u0E45\u0E48-\u0E4C\u0E47]/.test(nextChar)) {
          isFinal = false;
        } else if (prevChar && /[\u0E31\u0E34-\u0E39\u0E47]/.test(prevChar)) {
          isFinal = true;
        } else if (prevChar && /[ก-ฮ]/.test(prevChar)) {
          if (['อ', 'ว', 'ย', 'ร'].includes(characters[currentIndex]) && nextChar && /[ก-ฮ]/.test(nextChar)) {
             isFinal = false;
          } else {
             isFinal = true;
          }
        }
      }
    }
  }

  // Find previous consonant (Initial)
  if (isConsonant && !isFinal) {
    // If it's a consonant and NOT final, and NOT acting as a vowel, it might be the initial.
    // Wait, if it's ว acting as a vowel, we should look backwards!
    if (['อ', 'ว', 'ย', 'ร'].includes(characters[currentIndex]) && currentIndex > 0 && /[ก-ฮ]/.test(characters[currentIndex - 1])) {
       for (let i = currentIndex - 1; i >= 0; i--) {
         if (/[ก-ฮ]/.test(characters[i])) {
           initialConsonant = characters[i];
           initialConsonantIndex = i;
           break;
         }
       }
    } else {
      initialConsonant = characters[currentIndex];
      initialConsonantIndex = currentIndex;
    }
  } else {
    if (/[\u0E40-\u0E44]/.test(characters[currentIndex])) {
      for (let i = currentIndex + 1; i < characters.length; i++) {
        if (/[ก-ฮ]/.test(characters[i])) {
          initialConsonant = characters[i];
          initialConsonantIndex = i;
          break;
        }
      }
    } else {
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (/[ก-ฮ]/.test(characters[i])) {
          initialConsonant = characters[i];
          initialConsonantIndex = i;
          break;
        }
      }
    }
  }
  
  // Also check for 'Leading Consonant' (Akson Nam) like ห or a high class consonant
  let leadingConsonantClass: ToneClass | null = null;
  if (initialConsonantIndex > 0) {
    if (/[ก-ฮ]/.test(characters[initialConsonantIndex - 1])) {
       // Potential leading consonant
       const potentialLeader = characters[initialConsonantIndex - 1];
       if (potentialLeader === 'ห' || potentialLeader === 'อ') {
         leadingConsonantClass = potentialLeader === 'ห' ? 'high' : 'mid';
       }
    }
  }

  // 2. Identify Vowels & Vowel Length in the syllable block
  // We scan a small window around the initial consonant up to the current index
  const windowStart = initialConsonantIndex > -1 ? initialConsonantIndex : Math.max(0, currentIndex - 2);
  for (let i = windowStart; i <= currentIndex + 1; i++) {
    if (characters[i] && isShortVowel(characters[i])) {
      hasShortVowel = true;
    }
  }

  // 3. Identify Final Consonant
  let finalConsonantIndex = -1;
  
  if (isConsonant && isFinal) {
    finalConsonant = characters[currentIndex];
    finalConsonantIndex = currentIndex;
  } else if (initialConsonantIndex > -1) {
    // Let's find the final consonant of this syllable starting from the initial consonant.
    for (let i = initialConsonantIndex + 1; i < characters.length; i++) {
       // If we hit a pre-posed vowel, the current syllable has ended
       if (/[\u0E40-\u0E44]/.test(characters[i])) break;
       
       if (/[ก-ฮ]/.test(characters[i])) {
          const nextChar = i < characters.length - 1 ? characters[i + 1] : null;
          if (nextChar && /[\u0E30-\u0E39\u0E45\u0E48-\u0E4C\u0E47]/.test(nextChar)) {
             break; // Likely the initial consonant for the next syllable
          }
          finalConsonant = characters[i];
          finalConsonantIndex = i;
          break;
       }
    }
  }

  // 4. Check for implicit 'o' vowel (โ-ะ)
  // This occurs when a syllable has an initial and final consonant, but NO written vowels at all.
  let implicitVowelType: 'a' | 'o' | null = null;
  let specialVowelRule: string | undefined = undefined;

  if (initialConsonantIndex > -1 && finalConsonantIndex > -1) {
    const initIdx = initialConsonantIndex;
    const finIdx = finalConsonantIndex;
    
    // Check advanced phonetic rules based on clicked character (currentIndex)
    const activeChar = characters[currentIndex];

    // Rule 1: เ-อ -> เ-ิ (g-oe-d -> เกิด)
    if (activeChar === '\u0E34' && initIdx > 0 && characters[initIdx - 1] === 'เ') {
       specialVowelRule = 'oe_transformation';
    }
    
    // Rule 2: เ-อ + ย -> เ-ย (kh-oe-y -> เคย)
    if (activeChar === 'เ' && characters[finIdx] === 'ย') {
       let noOtherVowels = true;
       for (let i = initIdx; i <= finIdx; i++) {
         if (/[\u0E30-\u0E39\u0E45\u0E47-\u0E4D]/.test(characters[i])) noOtherVowels = false;
       }
       if (noOtherVowels) specialVowelRule = 'oe_y_transformation';
    }

    // Rule 3: -ัว -> -ว- (s-ua-y -> สวย)
    if (activeChar === 'ว' && currentIndex > initIdx && currentIndex < finIdx) {
       specialVowelRule = 'ua_transformation';
    }

    // Rule 5: เ-าะ -> -็อ (ch-o-k -> ช็อก)
    if ((activeChar === '\u0E47' && characters[currentIndex + 1] === 'อ') ||
        (activeChar === 'อ' && characters[currentIndex - 1] === '\u0E47')) {
       specialVowelRule = 'or_short_transformation';
    }

    // Rule 4: อ (O Ang) long vowel (n-o-n -> นอน)
    // Only if not part of or_short_transformation (-็อ) or oe_transformation
    if (!specialVowelRule && activeChar === 'อ' && currentIndex > initIdx && currentIndex < finIdx) {
       specialVowelRule = 'o_long_vowel';
    }

    if (finIdx > initIdx) {
      let foundVowel = false;
      // Check pre-posed vowels
      if (initIdx > 0 && /[\u0E40-\u0E44]/.test(characters[initIdx - 1])) {
        foundVowel = true;
      }
      // Check standard vowel marks in the range
      if (!foundVowel) {
        for (let i = initIdx; i <= finIdx; i++) {
          if (/[\u0E30-\u0E39\u0E45\u0E47-\u0E4D]/.test(characters[i])) {
            foundVowel = true;
            break;
          }
        }
      }
      // Check for consonant-vowels like อ, ว, ย between initial and final
      if (!foundVowel) {
        for (let i = initIdx + 1; i < finIdx; i++) {
           if (['อ', 'ว', 'ย', 'ร'].includes(characters[i])) {
             foundVowel = true;
             break;
           }
        }
      }
      
      if (!foundVowel) {
        implicitVowelType = getImplicitVowelType(currentIndex, characters);
        hasShortVowel = true; // Implicit A or O are both short vowels
      }
    }
  }

  if (finalConsonant) {
    finalFamily = getFinalConsonantFamily(finalConsonant);
  }

  const syllableType = getSyllableType(finalFamily, hasShortVowel);

  return {
    initialConsonant,
    initialConsonantIndex,
    leadingConsonantClass,
    hasShortVowel,
    implicitVowelType,
    specialVowelRule,
    finalConsonant,
    finalConsonantIndex,
    finalFamily,
    syllableType
  };
};
