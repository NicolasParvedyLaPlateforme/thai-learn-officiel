import { useProgressStore } from '@/lib/store';
import conversationsData from "@/data/conversations.json";
import courseData from "@/data/course.json";
import { getRequiredLessonsForConv, RequiredVocabLesson } from '@/lib/vocabulary-utils';

export type ConversationObjective = 
  | { type: 'vocab', conversation: any, lesson: any }
  | { type: 'conversation', conversation: any, levelToComplete: number }
  | null;

export function useNextConversationObjective(): ConversationObjective {
  const { completedConversations, lessonLevels } = useProgressStore();

  for (const conv of conversationsData.conversations) {
    const highestCompleted = completedConversations[conv.id] ?? -1;
    if (highestCompleted < 3) {
      // This is the first conversation that is not completely finished
      const vocabReqs = getRequiredLessonsForConv(conv.dialogs as any);
      const missingVocabReqs = vocabReqs.filter((req: any) => (lessonLevels[req.lessonId] || 0) < 1);

      if (missingVocabReqs.length > 0) {
        // Find the first missing vocabulary lesson requirement
        const firstMissing = missingVocabReqs[0];
        const lessonObj = courseData.lessons.find((l: any) => l.id === firstMissing.lessonId) || firstMissing;
        return {
          type: 'vocab',
          conversation: conv,
          lesson: lessonObj,
        };
      } else {
        return {
          type: 'conversation',
          conversation: conv,
          levelToComplete: highestCompleted + 1,
        };
      }
    }
  }

  return null;
}
