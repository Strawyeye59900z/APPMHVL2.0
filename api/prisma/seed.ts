import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@condominio.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@condominio.com',
      role: UserRole.ADMIN,
      passwordHash: hash,
      mustChangePassword: true,
    },
  });
  console.log('Seed concluído — admin@condominio.com / admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
