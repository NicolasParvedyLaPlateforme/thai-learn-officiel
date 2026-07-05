const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.user.findUnique({
  where: { email: 'nicolasparvedy@gmail.com' },
  select: { progressData: true }
}).then(u => {
  const pd = u.progressData;
  console.log('=== fullLevelsCompleted in DB ===');
  console.log(JSON.stringify(pd.fullLevelsCompleted));
  
  console.log('\n=== lessonLevels in DB ===');
  console.log(JSON.stringify(pd.lessonLevels, null, 2));
}).finally(() => p.$disconnect());
