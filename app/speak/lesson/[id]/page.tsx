import { getSpeakLessonData } from '../../../actions/speak_course';
import { getDictionaryForExercise } from '../../../actions/course';
import SpeakLessonClient from './SpeakLessonClient';
import { notFound } from 'next/navigation';

export default async function SpeakLessonPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ level: string }> 
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const lessonData = await getSpeakLessonData(resolvedParams.id);
  if (!lessonData) {
    notFound();
  }

  const level = parseInt(resolvedSearchParams.level || '1', 10);
  const dictionary = await getDictionaryForExercise();

  // Create the 20 steps (each phrase twice)
  let exerciseVocabulary = [];
  if (lessonData.phrases) {
    exerciseVocabulary = [...lessonData.phrases, ...lessonData.phrases];
    // Shuffle the array
    exerciseVocabulary.sort(() => Math.random() - 0.5);
  }

  return (
    <SpeakLessonClient 
      lessonId={resolvedParams.id} 
      level={level} 
      vocabulary={exerciseVocabulary} 
      dictionary={dictionary} 
      lessonTitle={lessonData.title}
    />
  );
}
