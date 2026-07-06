const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' },
    select: {
      id: true,
      name: true,
      email: true,
      xp: true,
      progressData: true
    }
  });
  fs.writeFileSync('scripts/user-progress-data.json', JSON.stringify(user, null, 2));
  console.log('Saved to scripts/user-progress-data.json');
  
  // Print key progress fields summary
  const pd = user.progressData;
  console.log('\n=== LESSON LEVELS ===');
  console.log(JSON.stringify(pd.lessonLevels, null, 2));
  
  console.log('\n=== FULL LEVELS COMPLETED ===');
  console.log(JSON.stringify(pd.fullLevelsCompleted, null, 2));
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
