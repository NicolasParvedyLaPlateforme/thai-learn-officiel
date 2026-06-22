'use server';

import { generateExercises, generateEndlessReviewExercises, generateWritingExercises, generateEndlessPairMatching, generateTrainingExercises, generateRevisionExercises } from "@/lib/generators";
import { generateAlphabetExercises, getAlphabetLessons } from "@/lib/alphabet-utils";
import courseData from "@/data/course.json";
import { CourseData, Word, Phrase } from "@/types";

const data = courseData as CourseData;

export async function getEndlessPairMatchingServer(completedLessons: string[], language: string) {
  return generateEndlessPairMatching(data.lessons, completedLessons, language);
}

export async function getWritingExercisesServer(targetLessons: string[], language: string, selectedWordIds: string[] | null) {
  return generateWritingExercises(data.lessons, targetLessons, language, selectedWordIds);
}

export async function getTrainingExercisesServer(lessonId: string, language: string, partIndex: number, totalParts: number) {
  const lesson = data.lessons.find(l => l.id === lessonId);
  if (!lesson) return [];
  return generateTrainingExercises(lesson, data.lessons, language, partIndex, totalParts);
}

export async function getRevisionExercisesServer(lessonId: string, language: string) {
  const lesson = data.lessons.find(l => l.id === lessonId);
  if (!lesson) return [];
  return generateRevisionExercises(lesson, data.lessons, language);
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
    titleEs: (l as any).titleEs,
    titleDe: (l as any).titleDe,
    titleIt: (l as any).titleIt,
    description: l.description,
    descriptionEn: l.descriptionEn,
    descriptionEs: (l as any).descriptionEs,
    descriptionDe: (l as any).descriptionDe,
    descriptionIt: (l as any).descriptionIt,
    unit: (l as any).unit,
    isReview: l.isReview,
    imageUrl: (l as any).imageUrl,
    words: l.words || [],
    phrases: l.phrases || [],
    part: l.part
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

export async function getExercisesServer(lessonId: string, currentLevel: number, language: string, partIndex: number | null = null, totalParts: number | null = null) {
  const lesson = data.lessons.find(l => l.id === lessonId);
  if (!lesson) return [];
  return generateExercises(lesson, data.lessons, currentLevel, language, partIndex, totalParts);
}

export async function getExactStepsCountServer(type: 'learn' | 'alphabet' | 'speak', lessonId: string, currentLevel: number, language: string, partIndex: number | null = null, totalParts: number | null = null): Promise<number> {
  if (type === 'alphabet') {
    const allPhrases = data.lessons.flatMap(l => l.phrases || []);
    const allWords = data.lessons.flatMap(l => l.words || []);
    const rawLessons = getAlphabetLessons();
    const allAlphaLessons = [...rawLessons.consonants, ...rawLessons.vowels];
    const lesson = allAlphaLessons.find(l => l.id === lessonId);
    if (!lesson) return 0;
    const exercises = generateAlphabetExercises(lesson, currentLevel, language, allWords as unknown as Word[], allPhrases as unknown as Phrase[]);
    return exercises.length;
  }
  
  if (type === 'speak') {
    const speakCourseData = (await import("@/data/speak_course.json")).default;
    const speakLessonMeta = speakCourseData.lessons.find((l: any) => l.id === lessonId) as any;
    if (!speakLessonMeta) return 0;
    
    if (currentLevel === 0) return speakLessonMeta.phraseIds?.length || 0;
    if (currentLevel === 1) return speakLessonMeta.dialogue?.length || 0;
    if (currentLevel === 2) {
       const speakAnswerMeData = (await import("@/data/speak_answer_me.json")).default as any;
       const answerData = speakAnswerMeData.exercises[lessonId] || [];
       return answerData.length;
    }
    if (currentLevel === 3 || currentLevel === 4) {
       return Math.min(3, speakLessonMeta.phraseIds.length);
    }
    return 0;
  }

  const lesson = data.lessons.find(l => l.id === lessonId);
  if (!lesson) return 0;
  const exercises = generateExercises(lesson, data.lessons, currentLevel, language, partIndex, totalParts);
  return exercises.length;
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
