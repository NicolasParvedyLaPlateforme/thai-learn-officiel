import { Exercise, Word, Phrase } from "@/types";
import { buildPairMatching } from '../builders';

export function generateLevel4To6(
  validLessonWords: Word[], 
  lessonPhrases: Phrase[], 
  globalWords: Word[], 
  allPhrases: Phrase[], 
  language: string, 
  level: number, 
  totalParts: number | null,
  fullLessonWords: Word[] = [],
  fullLessonPhrases: Phrase[] = []
): Exercise[] {
  let pmExercises: Exercise[] = [];
  
  const allItemsRaw = [...validLessonWords, ...lessonPhrases];
  let allItemsForPairsRaw = [...allItemsRaw];

  if (allItemsForPairsRaw.length < 4) {
    const fullItems = [...fullLessonWords, ...fullLessonPhrases];
    const allGlobalItemsRaw = [...globalWords, ...allPhrases];
    const existingIds = new Set(allItemsForPairsRaw.map(w => w.id));

    // Pad first with items from the same lesson (that are not in the current chunk)
    const shuffledFull = [...fullItems].sort(() => Math.random() - 0.5);
    for (const item of shuffledFull) {
      if (!existingIds.has(item.id)) {
        allItemsForPairsRaw.push(item);
        existingIds.add(item.id);
        if (allItemsForPairsRaw.length >= 4) break;
      }
    }

    // If still not enough (lesson has very few items), fallback to global words
    if (allItemsForPairsRaw.length < 4) {
      const shuffledGlobals = [...allGlobalItemsRaw].sort(() => Math.random() - 0.5);
      for (const item of shuffledGlobals) {
        if (!existingIds.has(item.id)) {
          allItemsForPairsRaw.push(item);
          existingIds.add(item.id);
          if (allItemsForPairsRaw.length >= 4) break;
        }
      }
    }
  }

  const allItemsForPairs = Array.from(new Map(allItemsForPairsRaw.map(w => [w.id, w])).values());
  
  let pairMatchMode: 'normal' | 'audio-only' | 'script-only' = 'normal';
  if (level === 5) pairMatchMode = 'audio-only';
  if (level === 6) pairMatchMode = 'script-only';

  let limit = 5;
  if (totalParts !== null && totalParts > 1) {
      limit = Math.max(1, Math.ceil(5 / totalParts));
  }

  for (let i = 0; i < limit; i++) {
    pmExercises.push(buildPairMatching({
      mode: pairMatchMode,
      pool: allItemsForPairs,
      language,
      hideRomanization: level === 4 ? (i >= Math.floor(5 / 3)) : false
    }));
  }
  
  return pmExercises;
}
