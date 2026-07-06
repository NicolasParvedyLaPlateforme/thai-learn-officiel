const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'nicolasparvedy@gmail.com' } });
  console.log(JSON.stringify({ 
    lessonLevels: user.lessonLevels, 
    lessonStars: user.lessonStars, 
    progressData: user.progressData 
  }, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
