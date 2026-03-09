
import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Databases ---');
  try {
    const databases = await prisma.$queryRawUnsafe('SHOW DATABASES');
    console.log(JSON.stringify(databases, null, 2));
  } catch (e) {
    console.error('Error listing databases:', e);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
