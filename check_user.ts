import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'nicolasparvedy@gmail.com' },
  });
  console.log(JSON.stringify((user?.progressData as any)?.fullLevelsCompleted, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
