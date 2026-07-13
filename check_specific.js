const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' }
  });
  console.log("l_nouveau_004 lessonLevels:", user.progressData.lessonLevels['l_nouveau_004']);
  console.log("l_nouveau_004 fullLevelsCompleted:", user.progressData.fullLevelsCompleted['l_nouveau_004']);
  console.log("l_nouveau_004 lessonPartsCompleted:");
  for (let i = 0; i < 10; i++) {
    const key = `l_nouveau_004_level-${i}`;
    console.log(`  level-${i}:`, user.progressData.lessonPartsCompleted[key]);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
