import { Word } from "@/types";

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Splits a Thai string into typing characters and their logical groupings.
 */
export function getWritingClustersAndGroups(text: string): { characters: string[], groups: number[] } {
  const characters: string[] = [];
  const groups: number[] = [];
  let currentGroupIndex = -1;

  const wordBoundaries = new Set<number>();
  try {
    const segmenter = new (globalThis as any).Intl.Segmenter('th', { granularity: 'word' });
    let offset = 0;
    for (const segment of segmenter.segment(text)) {
      offset += segment.segment.length;
      wordBoundaries.add(offset);
    }
  } catch (e) {
    // Ignore if not supported
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    const isPreposed = code >= 0x0E40 && code <= 0x0E44;
    const isPostposed = code === 0x0E30 || code === 0x0E32 || code === 0x0E33 || code === 0x0E45; // ะ, า, ำ, ๅ
    const isNonBase = 
      (code >= 0x0E31 && code <= 0x0E3A) || // top/bottom vowels, mai han-akat
      (code >= 0x0E47 && code <= 0x0E4E) || // tone marks & others
      (code === 0x0E3C); // korakot
      
    const isWordStart = i > 0 && wordBoundaries.has(i);

    if (isPreposed) {
      currentGroupIndex++;
    } else if (!isNonBase && !isPostposed) {
      if (isWordStart) {
        currentGroupIndex++;
      } else {
        const prevCode = i > 0 ? text[i-1].charCodeAt(0) : 0;
        const prevIsPreposed = prevCode >= 0x0E40 && prevCode <= 0x0E44;
        
        let formsCluster = false;
        const isCurrentConsonant = code >= 0x0E01 && code <= 0x0E2E;
        let hasVowelInGroup = false;
        let isFinalConsonant = false;
        
        if (isCurrentConsonant) {
          let lastConsonantCode = 0;
          let lastConsonantGroup = -1;
          
          for (let j = characters.length - 1; j >= 0; j--) {
             const c = characters[j].charCodeAt(0);
             if (groups[j] === currentGroupIndex) {
                 if ((c >= 0x0E40 && c <= 0x0E44) || // preposed
                     (c === 0x0E30 || c === 0x0E32 || c === 0x0E33 || c === 0x0E45) || // postposed
                     (c >= 0x0E31 && c <= 0x0E3A) || // top/bottom
                     (c === 0x0E47)) { // maitaikhu
                     hasVowelInGroup = true;
                 }
             }
             if (c >= 0x0E01 && c <= 0x0E2E && lastConsonantCode === 0) {
                lastConsonantCode = c;
                lastConsonantGroup = groups[j];
             }
          }
          
          if (lastConsonantCode !== 0 && (lastConsonantGroup === currentGroupIndex)) {
              // Ho Nam
              if (lastConsonantCode === 0x0E2B && [0x0E07, 0x0E0D, 0x0E19, 0x0E21, 0x0E22, 0x0E23, 0x0E25, 0x0E27].includes(code)) {
                formsCluster = true;
              }
              // O Nam
              else if (lastConsonantCode === 0x0E2D && code === 0x0E22) {
                formsCluster = true;
              }
              // True clusters
              else if ([0x0E01, 0x0E02, 0x0E04, 0x0E15, 0x0E1B, 0x0E1E].includes(lastConsonantCode) && [0x0E23, 0x0E25, 0x0E27].includes(code)) {
                formsCluster = true;
              }
              // ทร 
              else if (lastConsonantCode === 0x0E17 && code === 0x0E23) {
                formsCluster = true;
              }
          }

          if (hasVowelInGroup && !formsCluster) {
              const nextCode = i + 1 < text.length ? text[i+1].charCodeAt(0) : 0;
              const isNextVowelOrTone = 
                (nextCode === 0x0E30 || nextCode === 0x0E32 || nextCode === 0x0E33 || nextCode === 0x0E45) ||
                (nextCode >= 0x0E31 && nextCode <= 0x0E3A) || 
                (nextCode >= 0x0E47 && nextCode <= 0x0E4E);
              
              if (!isNextVowelOrTone) {
                  let nextFormsClusterWithCurrent = false;
                  if (nextCode >= 0x0E01 && nextCode <= 0x0E2E) {
                      if (code === 0x0E2B && [0x0E07, 0x0E0D, 0x0E19, 0x0E21, 0x0E22, 0x0E23, 0x0E25, 0x0E27].includes(nextCode)) nextFormsClusterWithCurrent = true;
                      else if (code === 0x0E2D && nextCode === 0x0E22) nextFormsClusterWithCurrent = true;
                      else if ([0x0E01, 0x0E02, 0x0E04, 0x0E15, 0x0E1B, 0x0E1E].includes(code) && [0x0E23, 0x0E25, 0x0E27].includes(nextCode)) nextFormsClusterWithCurrent = true;
                      else if (code === 0x0E17 && nextCode === 0x0E23) nextFormsClusterWithCurrent = true;
                  }
                  
                  if (code !== 0x0E2B && code !== 0x0E2D && !nextFormsClusterWithCurrent) {
                      isFinalConsonant = true;
                  }
              }
          }
        }

        if (!prevIsPreposed && !formsCluster && !isFinalConsonant) {
          currentGroupIndex++;
        }
      }
    }

    if (currentGroupIndex === -1) currentGroupIndex = 0;

    characters.push(char);
    groups.push(currentGroupIndex);
  }

  return { characters, groups };
}

export function generateMisspelledWords(word: Word, count: number): {id: string, th: string, fr: string, phonetic: string}[] {
  const chars = Array.from(word.th);
  // A few common Thai consonants to use for swapping
  const consonants = ['ก','ข','ค','ง','จ','ฉ','ช','ซ','ด','ต','ถ','ท','น','บ','ป','ผ','พ','ฟ','ม','ย','ร','ล','ว','ส','ห','อ'];
  const res = [];
  
  // Find a single valid index to mutate across all distractors
  let targetIdx = 0;
  let attempts = 0;
  while(attempts < 10) {
    const idx = Math.floor(Math.random() * chars.length);
    const code = chars[idx].charCodeAt(0);
    // only replace base consonants if possible to avoid breaking vowels
    if (code >= 0x0E01 && code <= 0x0E2E) {
      targetIdx = idx;
      break;
    }
    attempts++;
  }

  // Create unique replacements
  const usedConsonants = new Set([chars[targetIdx]]);
  
  for (let i=0; i<count; i++) {
    let newChars = [...chars];
    let rc = consonants[Math.floor(Math.random() * consonants.length)];
    
    // Ensure we pick a consonant we haven't used yet in this position
    let pickAttempts = 0;
    while (usedConsonants.has(rc) && pickAttempts < 20) {
       rc = consonants[Math.floor(Math.random() * consonants.length)];
       pickAttempts++;
    }
    usedConsonants.add(rc);
    
    newChars[targetIdx] = rc;
    
    res.push({
      id: `fake-${word.id}-${i}-${Date.now()}`,
      th: newChars.join(''),
      fr: '',
      phonetic: ''
    });
  }
  return res;
}

export function getRandomDistractorMode(): 'random' | 'reverse' {
  const rand = Math.random();
  if (rand < 0.5) return 'random';
  return 'reverse';
}
