import { Lesson, Exercise } from "@/types";
import { generateLevel0, generateLevel1, generateLevel2, generateLevel3, generateLevel4To6, generateLevel7, generateLevel8, generateLevel9 } from './levels';
import { generateReviewLesson } from './reviews';
import { buildIntro } from './builders';

export function generateExercises(
  lesson: Lesson, 
  allLessons: Lesson[], 
  level: number = 0, 
  language: string = 'fr', 
  partIndex: number | null = null, 
  totalParts: number | null = null
): Exercise[] {
  const globalWords = allLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
  let validLessonWords = lesson.words.filter(w => w.id !== 'w_dots');
  let lessonPhrases = lesson.phrases || [];
  const fullLessonWords = [...validLessonWords];
  const fullLessonPhrases = [...lessonPhrases];

  if (partIndex !== null && totalParts !== null && totalParts > 1) {
    const getChunk = <T>(arr: T[], pIndex: number, tParts: number): T[] => {
      const baseSize = Math.floor(arr.length / tParts);
      const remainder = arr.length % tParts;
      const start = pIndex * baseSize + Math.min(pIndex, remainder);
      const length = baseSize + (pIndex < remainder ? 1 : 0);
      return arr.slice(start, start + length);
    };
    validLessonWords = getChunk(validLessonWords, partIndex, totalParts);
    lessonPhrases = getChunk(lessonPhrases, partIndex, totalParts);
  }

  if (lesson.isReview) {
    const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
    let unitStartIdx = 0;
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (allLessons[i].isReview) {
        unitStartIdx = i + 1;
        break;
      }
    }
    const unitLessons = allLessons.slice(unitStartIdx, currentIdx);
    let unitWords = unitLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
    let unitPhrases = unitLessons.flatMap(l => l.phrases);
    const allPhrases = allLessons.flatMap(l => l.phrases);

    if (partIndex !== null && totalParts !== null && totalParts > 1) {
       const getChunk = <T>(arr: T[], pIndex: number, tParts: number): T[] => {
         const baseSize = Math.floor(arr.length / tParts);
         const remainder = arr.length % tParts;
         const start = pIndex * baseSize + Math.min(pIndex, remainder);
         const length = baseSize + (pIndex < remainder ? 1 : 0);
         return arr.slice(start, start + length);
       };
       unitWords = getChunk(unitWords, partIndex, totalParts);
       unitPhrases = getChunk(unitPhrases, partIndex, totalParts);
    }

    return generateReviewLesson(unitWords, unitPhrases, allPhrases, globalWords, language, level, totalParts);
  }

  if (level === 0) {
     return generateLevel0(validLessonWords, globalWords, language);
  }

  let finalExercises: Exercise[] = [];
  const allPhrases = allLessons.flatMap(l => l.phrases);

  switch (level) {
    case 1:
      finalExercises = generateLevel1(validLessonWords, lessonPhrases, globalWords, language);
      break;
    case 2:
      finalExercises = generateLevel2(validLessonWords, lessonPhrases, globalWords, language);
      break;
    case 3:
      finalExercises = generateLevel3(validLessonWords, lessonPhrases, globalWords, allPhrases, language, totalParts);
      break;
    case 4:
    case 5:
    case 6:
      finalExercises = generateLevel4To6(validLessonWords, lessonPhrases, globalWords, allPhrases, language, level, totalParts, fullLessonWords, fullLessonPhrases);
      break;
    case 7:
      finalExercises = generateLevel7(validLessonWords, language);
      break;
    case 8:
      finalExercises = generateLevel8(validLessonWords, lessonPhrases, language);
      break;
    case 9:
      finalExercises = generateLevel9(validLessonWords, lessonPhrases, language, totalParts);
      return finalExercises; // No intro processing needed
    case 10:
      let previousLevels: Exercise[] = [];
      for (let l = 0; l <= 8; l++) {
        previousLevels.push(...generateExercises(lesson, allLessons, l, language));
      }
      const ftExercises = generateLevel9(validLessonWords, lessonPhrases, language, null);
      return [...previousLevels, ...ftExercises.slice(0, 10)].map(ex => ({
        ...ex,
        forceHideRomanization: true
      }));
  }

  // Prevent consecutive same answers
  const result: Exercise[] = [];
  const waitlist: Exercise[] = [];
  
  for (let i = 0; i < finalExercises.length; i++) {
     const current = finalExercises[i];
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
  const finalResult = [...result, ...waitlist];

  // Intros logic
  const exercisesWithIntros: Exercise[] = [];
  const introducedIds = new Set<string>();

  for (const ex of finalResult) {
    if (level === 1 && ex.type === 'sentence-builder') {
      const phrase = lessonPhrases.find(p => p.th === ex.answer);
      if (phrase && !introducedIds.has(phrase.id)) {
        introducedIds.add(phrase.id);
        exercisesWithIntros.push(buildIntro(phrase, language));
      }
    }
    exercisesWithIntros.push(ex);
  }

  // Prevent consecutive word-match exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of exercisesWithIntros) {
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

  return exercisesWithIntros;
}

import { shuffle } from './utils';

function pickRandomExercises(pools: Exercise[][], count: number = 5): Exercise[] {
  let all = pools.flat();
  all = shuffle(all);
  all = all.filter(e => e.type !== 'intro');
  
  const result: Exercise[] = [];
  const usedTypes = new Set<string>();

  for (const ex of all) {
    if (result.length >= count) break;
    if (result.length === 0 || result[result.length - 1].answer !== ex.answer) {
      result.push(ex);
      usedTypes.add(ex.type);
    }
  }

  if (result.length < count) {
    // Phase 1: Try to add unused types first
    for (const ex of all) {
      if (result.length >= count) break;
      if (!result.includes(ex) && !usedTypes.has(ex.type)) {
        result.push(ex);
        usedTypes.add(ex.type);
      }
    }
    // Phase 2: Try to avoid same consecutive types
    for (const ex of all) {
      if (result.length >= count) break;
      if (!result.includes(ex) && result[result.length - 1]?.type !== ex.type) {
        result.push(ex);
      }
    }
    // Phase 3: Fill whatever is left
    for (const ex of all) {
      if (result.length >= count) break;
      if (!result.includes(ex)) result.push(ex);
    }
  }
  return result;
}

export function generateTrainingExercises(
  lesson: Lesson,
  allLessons: Lesson[],
  language: string = 'fr',
  partIndex: number,
  totalParts: number
): Exercise[] {
  const pools = [];
  for (let lvl = 0; lvl <= 8; lvl++) {
    pools.push(generateExercises(lesson, allLessons, lvl, language, partIndex, totalParts));
  }
  return pickRandomExercises(pools, 5);
}

export function generateRevisionExercises(
  lesson: Lesson,
  allLessons: Lesson[],
  language: string = 'fr'
): Exercise[] {
  const pools = [];
  for (let lvl = 0; lvl <= 9; lvl++) {
    pools.push(generateExercises(lesson, allLessons, lvl, language, null, null));
  }
  return pickRandomExercises(pools, 5);
}
