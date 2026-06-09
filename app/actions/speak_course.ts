'use server';

import speakCourseData from '../data/speak_course.json';
import courseData from '../data/course.json';
import { CourseData } from '../types';

const data = courseData as CourseData;

export async function getLightweightSpeakLessons() {
  const allPhrases = data.lessons.flatMap(l => l.phrases || []);
  
  return speakCourseData.lessons.map((l: any) => {
    // Reconstruct phrases from IDs
    const phrases = l.phraseIds
      .map((id: string) => allPhrases.find(p => p.id === id))
      .filter(Boolean);

    return {
      id: l.id,
      title: l.title,
      titleEn: l.titleEn,
      description: l.description,
      descriptionEn: l.descriptionEn,
      unit: l.unit,
      isReview: l.isReview,
      imageUrl: l.imageUrl,
      words: [], // Speak lessons primarily use phrases for now
      phrases: phrases
    };
  });
}

export async function getSpeakLessonData(lessonId: string) {
  const lessonMeta = speakCourseData.lessons.find((l: any) => l.id === lessonId);
  if (!lessonMeta) return null;

  const allPhrases = data.lessons.flatMap(l => l.phrases || []);
  const phrases = lessonMeta.phraseIds
      .map((id: string) => allPhrases.find(p => p.id === id))
      .filter(Boolean);

  return {
    ...lessonMeta,
    phrases
  };
}
