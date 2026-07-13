const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' }
  });
  console.log('lesson-1 lessonLevels:', user.progressData.lessonLevels['lesson-1']);
  console.log('lesson-1 fullLevelsCompleted:', user.progressData.fullLevelsCompleted['lesson-1']);
  console.log('lesson-1 lessonPartsCompleted:');
  for (let i = 0; i <= 10; i++) {
    const key = `lesson-1_level-${i}`;
    console.log(`  level-${i}:`, user.progressData.lessonPartsCompleted[key]);
  }
}

main().finally(() => prisma.$disconnect());
