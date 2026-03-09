
import { PrismaClient } from '../lib/generated/prisma';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const tables = ['cliente', 'clientes'];
  let output = '';
  for (const table of tables) {
    output += `--- Columns for table: ${table} ---\n`;
    try {
      const columns = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM ${table}`);
      output += JSON.stringify(columns, null, 2) + '\n';
    } catch (e) {
      output += `Table ${table} not found or error.\n`;
    }
  }
  fs.writeFileSync('prisma/schema-check.json', output);
  console.log('Inspection complete. Results in prisma/schema-check.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
