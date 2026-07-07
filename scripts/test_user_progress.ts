import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' },
    select: { progressData: true }
  });
  
  const progressData = user?.progressData as any;
  if (!progressData) {
    console.log("No progress data found.");
    return;
  }
  
  console.log("lessonPartsCompleted:", progressData.lessonPartsCompleted);
  console.log("lessonLevels:", progressData.lessonLevels);
  console.log("fullLevelsCompleted:", progressData.fullLevelsCompleted);
}
main();
