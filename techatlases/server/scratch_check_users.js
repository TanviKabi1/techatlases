import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ include: { roles: true } });
  console.log('--- USER LIST ---');
  users.forEach(u => {
    console.log(`Email: ${u.email}, Roles: ${u.roles.map(r => r.role).join(', ')}`);
  });
  console.log('-----------------');
}

main().finally(() => prisma.$disconnect());
