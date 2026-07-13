const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const u1_lessons = require('./src/data/course.json').lessons;

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' }
  });
  const progressData = user.progressData;
  const lessonLevels = progressData.lessonLevels || {};
  const fullLevelsCompleted = progressData.fullLevelsCompleted || {};
  
  const lastPlayedLessonId = progressData.lastPlayedLessonId || 'lesson-1';
  const lastPlayedLessonType = progressData.lastPlayedLessonType || 'learn';
  const maxLevel = 10;
  
  let suggestionFromLastPlayed = null;
  const list = u1_lessons;
  const currentIndex = list.findIndex(l => l.id === lastPlayedLessonId);
  
  if (currentIndex !== -1) {
      const currentLevel = lessonLevels[lastPlayedLessonId] || 0;
      const isComplete = currentLevel >= maxLevel || (fullLevelsCompleted[lastPlayedLessonId] || []).includes(maxLevel - 1);
      if (!isComplete) {
         suggestionFromLastPlayed = { id: lastPlayedLessonId, type: lastPlayedLessonType };
      } else {
         for (let i = currentIndex + 1; i < list.length; i++) {
            const nextLessonId = list[i].id;
            const nextLessonLevel = lessonLevels[nextLessonId] || 0;
            const nextIsComplete = nextLessonLevel >= maxLevel || (fullLevelsCompleted[nextLessonId] || []).includes(maxLevel - 1);
            if (!nextIsComplete) {
               suggestionFromLastPlayed = { id: nextLessonId, type: lastPlayedLessonType };
               break;
            }
         }
      }
  }

  let furthestInProgress = null;
  for (const lesson of list) {
      const level = lessonLevels[lesson.id] || 0;
      const isComplete = level >= 10 || (fullLevelsCompleted[lesson.id] || []).includes(9);
      if (level > 0 && !isComplete && !furthestInProgress) {
        furthestInProgress = { id: lesson.id, type: 'learn' };
      }
  }
  
  console.log("suggestionFromLastPlayed:", suggestionFromLastPlayed);
  console.log("furthestInProgress:", furthestInProgress);
}

main().finally(() => prisma.$disconnect());
