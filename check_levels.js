const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' }
  });
  console.log('lessonLevels lesson-1:', user.progressData.lessonLevels['lesson-1']);
  console.log('lessonLevels lesson-2:', user.progressData.lessonLevels['lesson-2']);
}

main().finally(() => prisma.$disconnect());
