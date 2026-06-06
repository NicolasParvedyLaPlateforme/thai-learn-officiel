export type ConsonantClass = 'high' | 'mid' | 'low';
export type Tone = 'mid' | 'low' | 'falling' | 'high' | 'rising';
export type ToneMark = 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa';
export type EndingType = 'live' | 'dead';
export type VowelLength = 'short' | 'long';

export interface ToneAnalysis {
  syllable: string;
  initCons: string;
  initialClass: ConsonantClass;
  vowelLength: VowelLength;
  endingType: EndingType;
  toneMark: ToneMark;
  finalTone: Tone;
  isAksonNamApplied?: boolean;
  error?: string;
}

const CONSONANT_CLASSES = {
  high: ['ข', 'ฃ', 'ฉ', 'ฐ', 'ถ', 'ผ', 'ฝ', 'ศ', 'ษ', 'ส', 'ห'],
  mid: ['ก', 'จ', 'ฎ', 'ฏ', 'ด', 'ต', 'บ', 'ป', 'อ'],
  low: ['ค', 'ฅ', 'ฆ', 'ง', 'ช', 'ซ', 'ฌ', 'ญ', 'ฑ', 'ฒ', 'ณ', 'ท', 'ธ', 'น', 'พ', 'ฟ', 'ภ', 'ม', 'ย', 'ร', 'ล', 'ว', 'ฬ', 'ฮ']
};

const DEAD_ENDINGS = ['ก', 'ด', 'บ', 'ข', 'ค', 'ฆ', 'จ', 'ช', 'ซ', 'ฎ', 'ฏ', 'ฐ', 'ฑ', 'ฒ', 'ต', 'ถ', 'ท', 'ธ', 'ศ', 'ษ', 'ส', 'ป', 'พ', 'ฟ', 'ภ'];
const LIVE_ENDINGS = ['ง', 'น', 'ม', 'ย', 'ว', 'ณ', 'ญ', 'ร', 'ล', 'ฬ'];

const SHORT_VOWELS_MARKS = ['ะ', 'ั', 'ิ', 'ึ', 'ุ', '็', 'ำ', 'ไ', 'ใ']; // ำ, ไ, ใ act as short for dead/live calc sometimes, but phonologically they end in m/y so they are live.
// Note: 'ำ', 'ไ', 'ใ', 'เ-า' are considered LIVE syllables in Thai tone rules because they end with sonorant sounds (m, y, y, w).
const LIVE_SPECIAL_VOWELS = ['ำ', 'ไ', 'ใ', 'า']; 

const TONE_MARKS: Record<string, ToneMark> = {
  '่': 'mai_ek',
  '้': 'mai_tho',
  '๊': 'mai_tri',
  '๋': 'mai_chattawa'
};

export function analyzeSyllable(syllable: string, previousSyllable?: string): ToneAnalysis {
  // Simplification for the visualizer: We expect a single syllable.
  // Basic regex for Thai syllable: (Leading Vowel)? (Initial Consonant) (Cluster Consonant)? (Top/Bottom Vowel)? (Tone Mark)? (Top/Bottom Vowel)? (Final Consonant/Vowel)?
  const regex = /^([เแโใไ])?([ก-ฮ])([ก-ฮรลว])?([ะ-ู็])?([่-๋])?([ะ-ู็])?([าอยวำ])?([ก-ฮ])?$/;
  const match = syllable.trim().match(regex);
  
  if (!match) {
    return {
      syllable,
      initCons: '',
      initialClass: 'low',
      vowelLength: 'long',
      endingType: 'live',
      toneMark: 'none',
      finalTone: 'mid',
      error: "Cette syllabe est trop complexe ou n'est pas reconnue."
    };
  }

  const [ _, leadVowel, initCons, cluster, vowel1, toneMarkRaw, vowel2, trailingVowel, finalCons ] = match;
  
  // 1. Initial Consonant Class (use the lead consonant of a cluster if it modifies the class, e.g., หนำ. But we keep it simple: use initCons)
  // Actually, leading ห (Ho Nam) changes the class of a low consonant to high.
  let effectiveInitCons = initCons;
  if (initCons === 'ห' && cluster && CONSONANT_CLASSES.low.includes(cluster)) {
    effectiveInitCons = cluster; // It's a low class consonant but acts as High Class!
    // But wait, the class to apply is High.
  } else if (initCons === 'อ' && cluster === 'ย') {
    effectiveInitCons = cluster; // Acts as Mid class!
  }

  let initialClass: ConsonantClass = 'low';
  if (initCons === 'ห' && cluster) {
      initialClass = 'high';
  } else if (initCons === 'อ' && cluster === 'ย') {
      initialClass = 'mid';
  } else if (CONSONANT_CLASSES.high.includes(initCons)) {
    initialClass = 'high';
  } else if (CONSONANT_CLASSES.mid.includes(initCons)) {
    initialClass = 'mid';
  }

  // --- AKSON NAM LOGIC ---
  const SONORANTS = ['ง', 'น', 'ม', 'ย', 'ร', 'ล', 'ว'];
  let isAksonNamApplied = false;

  if (previousSyllable && previousSyllable.length === 1 && /^[ก-ฮ]$/.test(previousSyllable) && SONORANTS.includes(initCons)) {
      if (CONSONANT_CLASSES.high.includes(previousSyllable)) {
          initialClass = 'high';
          isAksonNamApplied = true;
      } else if (CONSONANT_CLASSES.mid.includes(previousSyllable)) {
          initialClass = 'mid';
          isAksonNamApplied = true;
      }
  }

  // 2. Vowel Length
  // By default, assume long unless we see a short vowel mark
  let vowelLength: VowelLength = 'long';
  const allVowels = [vowel1, vowel2, leadVowel, trailingVowel].filter(Boolean) as string[];
  if (allVowels.some(v => ['ะ', 'ั', 'ิ', 'ึ', 'ุ', '็'].includes(v))) {
    vowelLength = 'short';
  }
  // ำ, ไ, ใ act as short vowels phonetically but create LIVE endings.

  // 3. Ending Type (Live or Dead)
  let endingType: EndingType = 'live';
  if (finalCons) {
    if (DEAD_ENDINGS.includes(finalCons)) {
      endingType = 'dead';
    }
  } else {
    // Open syllable (no final consonant)
    if (vowelLength === 'short' && !allVowels.some(v => ['ำ', 'ไ', 'ใ'].includes(v))) {
      endingType = 'dead';
    }
  }

  // 4. Tone Mark
  const toneMark: ToneMark = toneMarkRaw ? TONE_MARKS[toneMarkRaw] : 'none';

  // 5. Calculate Final Tone
  let finalTone: Tone = 'mid';

  if (initialClass === 'mid') {
    if (toneMark === 'none') {
      finalTone = endingType === 'live' ? 'mid' : 'low';
    } else if (toneMark === 'mai_ek') finalTone = 'low';
    else if (toneMark === 'mai_tho') finalTone = 'falling';
    else if (toneMark === 'mai_tri') finalTone = 'high';
    else if (toneMark === 'mai_chattawa') finalTone = 'rising';
  } 
  else if (initialClass === 'high') {
    if (toneMark === 'none') {
      finalTone = endingType === 'live' ? 'rising' : 'low';
    } else if (toneMark === 'mai_ek') finalTone = 'low';
    else if (toneMark === 'mai_tho') finalTone = 'falling';
  } 
  else if (initialClass === 'low') {
    if (toneMark === 'none') {
      if (endingType === 'live') finalTone = 'mid';
      else if (endingType === 'dead' && vowelLength === 'short') finalTone = 'high';
      else if (endingType === 'dead' && vowelLength === 'long') finalTone = 'falling';
    } else if (toneMark === 'mai_ek') finalTone = 'falling'; // Notice the shift!
    else if (toneMark === 'mai_tho') finalTone = 'high';    // Notice the shift!
  }

  return {
    syllable,
    initCons: (initCons === 'ห' && cluster) ? `${initCons}${cluster}` : initCons,
    initialClass,
    vowelLength,
    endingType,
    toneMark,
    finalTone,
    isAksonNamApplied
  };
}
