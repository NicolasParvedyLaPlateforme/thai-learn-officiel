import { getSpeakLessonData } from '../../../actions/speak_course';
import { getDictionaryForExercise } from '../../../actions/course';
import SpeakLessonClient from './SpeakLessonClient';
import { notFound } from 'next/navigation';

export default async function SpeakLessonPage({ params, searchParams }: { params: { id: string }, searchParams: { level: string } }) {
  const lessonData = await getSpeakLessonData(params.id);
  if (!lessonData) {
    notFound();
  }

  const level = parseInt(searchParams.level || '1', 10);
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
      lessonId={params.id} 
      level={level} 
      vocabulary={exerciseVocabulary} 
      dictionary={dictionary} 
      lessonTitle={lessonData.title}
    />
  );
}
