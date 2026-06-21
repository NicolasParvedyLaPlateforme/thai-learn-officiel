import { Exercise, Word, Phrase } from "@/types";
import { buildPairMatching } from '../builders';

export function generateLevel4To6(
  validLessonWords: Word[], 
  lessonPhrases: Phrase[], 
  globalWords: Word[], 
  allPhrases: Phrase[], 
  language: string, 
  level: number, 
  totalParts: number | null
): Exercise[] {
  let pmExercises: Exercise[] = [];
  
  const allItemsRaw = [...validLessonWords, ...lessonPhrases];
  const allGlobalItemsRaw = [...globalWords, ...allPhrases];
  const allItemsForPairsRaw = allItemsRaw.length >= 4 ? allItemsRaw : allGlobalItemsRaw;
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
