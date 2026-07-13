const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'nicolasparvedy@gmail.com' } });
  console.log(user.progressData.fullLevelsCompleted);
}
main().finally(() => prisma.$disconnect());
