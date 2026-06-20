import { Lesson, Exercise } from "@/types";
import { getExerciseTranslation } from '../translation-utils';
import { shuffle, getWritingClustersAndGroups } from './utils';

export function generateWritingExercises(
  allLessons: Lesson[], 
  completedLessonIds: string[], 
  language: string = 'fr',
  selectedWordIds: string[] | null = null
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];

  const candidateItems: { fr: string, th: string, id: string, imageUrl?: string }[] = [];
  completedLessons.forEach(l => {
    l.words.filter(w => w.id !== 'w_dots').forEach(w => candidateItems.push({ fr: getExerciseTranslation(w, language), th: w.th, id: w.id, imageUrl: w.imageUrl }));
    l.phrases.forEach(p => candidateItems.push({ fr: getExerciseTranslation(p, language), th: p.th, id: p.id, imageUrl: p.imageUrl }));
  });

  const filteredItems = selectedWordIds 
    ? candidateItems.filter(item => selectedWordIds.includes(item.id))
    : candidateItems;

  if (filteredItems.length === 0) return [];

  const shuffledCandidates = shuffle(filteredItems).slice(0, 20);
  
  return shuffledCandidates.map((item, idx) => {
    const { characters, groups } = getWritingClustersAndGroups(item.th.replace(/\s+/g, ''));
    return {
      id: `writing-${idx}-${Date.now()}`,
      type: 'writing' as any,
      question: item.fr,
      answer: item.th,
      options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
      correctComponents: characters, // Representing the order of individual characters
      componentGroups: groups,
      hideHints: false,
      imageUrl: item.imageUrl
    };
  });
}
