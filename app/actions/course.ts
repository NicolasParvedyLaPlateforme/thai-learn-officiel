'use server';

import { generateExercises, generateEndlessReviewExercises, generateWritingExercises, generateEndlessPairMatching } from '../lib/exercise-generator';
import { generateAlphabetExercises, getAlphabetLessons } from '../lib/alphabet-utils';
import courseData from '../data/course.json';
import { CourseData, Word, Phrase } from '../types';

const data = courseData as CourseData;

export async function getEndlessPairMatchingServer(completedLessons: string[], language: string) {
  return generateEndlessPairMatching(data.lessons, completedLessons, language);
}

export async function getWritingExercisesServer(targetLessons: string[], language: string, selectedWordIds: string[] | null) {
  return generateWritingExercises(data.lessons, targetLessons, language, selectedWordIds);
}

export async function getAlphabetExercisesServer(lessonId: string, currentLevel: number, language: string) {
  const allPhrases = data.lessons.flatMap(l => l.phrases || []);
  const allWords = data.lessons.flatMap(l => l.words || []);
  
  const rawLessons = getAlphabetLessons();
  const allAlphaLessons = [...rawLessons.consonants, ...rawLessons.vowels];
  const lesson = allAlphaLessons.find(l => l.id === lessonId);
  
  if (!lesson) return [];
  return generateAlphabetExercises(lesson, currentLevel, language, allWords as unknown as Word[], allPhrases as unknown as Phrase[]);
}

export async function getLightweightLessons() {
  return data.lessons.map(l => ({
    id: l.id,
    title: l.title,
    titleEn: l.titleEn,
    description: l.description,
    descriptionEn: l.descriptionEn,
    unit: (l as any).unit,
    isReview: l.isReview,
    imageUrl: (l as any).imageUrl,
    words: l.words || []
  }));
}

export async function getDictionaryForExerciseServer() {
  return data.lessons.flatMap(l => l.words || []);
}

export async function getPhrasesForExerciseServer() {
  return data.lessons.flatMap(l => l.phrases || []);
}

export async function getLessonData(lessonId: string) {
  return data.lessons.find(l => l.id === lessonId);
}

export async function getExercisesServer(lessonId: string, currentLevel: number, language: string) {
  const lesson = data.lessons.find(l => l.id === lessonId);
  if (!lesson) return [];
  return generateExercises(lesson, data.lessons, currentLevel, language);
}

export async function getEndlessReviewServer(completedLessons: string[], language: string, options: any) {
  return generateEndlessReviewExercises(data.lessons, completedLessons, language, options);
}

export async function getVocabularyServer(lessonId: string | 'all', completedLessons: string[]) {
  let lessonsToProcess: any[] = [];
  if (lessonId === 'all') {
    lessonsToProcess = data.lessons.filter(l => completedLessons.includes(l.id));
  } else {
    const lesson = data.lessons.find(l => l.id === lessonId);
    if (lesson) lessonsToProcess = [lesson];
  }
  
  const words = lessonsToProcess.flatMap(l => l.words || []);
  const phrases = lessonsToProcess.flatMap(l => l.phrases || []);
  return [...words, ...phrases];
}

export async function getDictionaryForExercise() {
  // Returns list of words to show in hints. This might be heavy, but let's see. 
  // Wait, if it's endless review, maybe the client just needs these when checking?
  // Let's just return basic info for words? For now we'll return what's needed.
  return data.lessons.flatMap(l => l.words || []);
}

export async function getPhrasesForExercise() {
  return data.lessons.flatMap(l => l.phrases || []);
}
