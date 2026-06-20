import { useProgressStore } from './store';
import conversationsData from "@/data/conversations.json";
import { getRequiredLessonsForConv, RequiredVocabLesson } from './vocabulary-utils';

export type ConversationObjective = 
  | { type: 'vocab', conversationTitle: string, conversationTitleEn: string | undefined, lessonId: string, lessonTitle: string, lessonTitleEn: string }
  | { type: 'conversation', conversationId: string, conversationTitle: string, conversationTitleEn: string | undefined, levelToComplete: number }
  | null;

export function useNextConversationObjective(): ConversationObjective {
  const { completedConversations, lessonLevels } = useProgressStore();

  for (const conv of conversationsData.conversations) {
    const highestCompleted = completedConversations[conv.id] ?? -1;
    if (highestCompleted < 3) {
      // This is the first conversation that is not completely finished
      const vocabReqs = getRequiredLessonsForConv(conv.dialogs as any);
      const missingVocabReqs = vocabReqs.filter(req => (lessonLevels[req.lessonId] || 0) < 1);

      if (missingVocabReqs.length > 0) {
        // Find the first missing vocabulary lesson requirement
        const firstMissing = missingVocabReqs[0];
        return {
          type: 'vocab',
          conversationTitle: conv.title,
          conversationTitleEn: conv.titleEn,
          lessonId: firstMissing.lessonId,
          lessonTitle: firstMissing.lessonTitle,
          lessonTitleEn: firstMissing.lessonTitleEn,
        };
      } else {
        return {
          type: 'conversation',
          conversationId: conv.id,
          conversationTitle: conv.title,
          conversationTitleEn: conv.titleEn,
          levelToComplete: highestCompleted + 1,
        };
      }
    }
  }

  return null;
}
