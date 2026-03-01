
import { PrismaClient } from '../lib/generated/prisma';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const db = 'tufibra_churin';
  try {
    const tables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES FROM ${db}`);
    const tableNames = tables.map(t => Object.values(t)[0]);
    fs.writeFileSync('prisma/isp-tables.json', JSON.stringify(tableNames, null, 2));
    console.log(`Inspection complete. ${tableNames.length} tables found in ${db}.`);
  } catch (e) {
    console.error(`Error listing tables in ${db}:`, e);
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
