import { Lesson, Exercise, Word } from "@/types";
import { getExerciseTranslation } from '../translation-utils';
import { shuffle } from './utils';

export interface ReviewOptions {
  showWordHints: boolean;
  showUsefulVocab: boolean;
  includeDistractors: boolean;
  limitDistractors: number;
}

export function generateEndlessReviewExercises(
  allLessons: Lesson[], 
  completedLessonIds: string[], 
  language: string = 'fr',
  options?: ReviewOptions
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];

  const defaultOptions: ReviewOptions = {
    showWordHints: true,
    showUsefulVocab: true,
    includeDistractors: true,
    limitDistractors: 2,
    ...options
  };

  let exercises: Exercise[] = [];
  const globalWords = allLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
  
  // Create collections of number words
  const numberLessons = allLessons.filter(l => l.title.toLowerCase().includes('nombre') || l.titleEn?.toLowerCase().includes('number'));
  const numberWords = numberLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');

  completedLessons.forEach(prevLesson => {
    const isNumberLesson = prevLesson.title.toLowerCase().includes('nombre') || prevLesson.titleEn?.toLowerCase().includes('number');
    const distractorPool = isNumberLesson ? numberWords : globalWords;
    const numDistractors = defaultOptions.includeDistractors ? defaultOptions.limitDistractors : 0;

    // word match
    prevLesson.words.filter(w => w.id !== 'w_dots').forEach(word => {
      // Word match always has 3 distractors (4 options total)
      const distractors = shuffle(distractorPool.filter(w => w.id !== word.id)).slice(0, 3);
      exercises.push({
        id: `endless-wm-${word.id}-${Date.now()}-${Math.random()}`,
        type: 'word-match',
        question: getExerciseTranslation(word, language),
        answer: word.th,
        options: shuffle([word, ...distractors]),
        hideHints: !defaultOptions.showUsefulVocab,
        disableTooltips: !defaultOptions.showWordHints,
        imageUrl: word.imageUrl
      } as any); // Type assertion for now since we'll add these options to Exercise interface
    });
    // sentence builder
    prevLesson.phrases.forEach(phrase => {
      const phraseWords = phrase.components.map(id => globalWords.find(w => w.id === id)).filter(Boolean) as Word[];
      // Distractors for sentence builder: shouldn't use number words unless it's a number lesson
      const sbDistractorPool = isNumberLesson ? numberWords : globalWords;
      const distractors = shuffle(sbDistractorPool.filter(w => !phrase.components.includes(w.id))).slice(0, numDistractors);
      exercises.push({
        id: `endless-sb-${phrase.id}-${Date.now()}-${Math.random()}`,
        type: 'sentence-builder',
        question: getExerciseTranslation(phrase, language),
        answer: phrase.th,
        options: shuffle([...phraseWords, ...distractors]),
        correctComponents: phrase.components,
        hideHints: !defaultOptions.showUsefulVocab,
        disableTooltips: !defaultOptions.showWordHints,
        imageUrl: phrase.imageUrl
      } as any);
    });
  });

  const finalBatch = shuffle(exercises).slice(0, 20); // Return a batch of 20 random exercises
  
  // Prevent consecutive word-match exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of finalBatch) {
    if (ex.type === 'word-match' && !ex.isFillInBlank && ex.options && ex.options.length > 1) {
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
  
  return finalBatch;
}
