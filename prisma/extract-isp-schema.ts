
import { PrismaClient } from '../lib/generated/prisma';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const db = 'tufibra_churin';
  const tables = ['cliente', 'contrato', 'servicio', 'orden_trabajo', 'deuda'];
  let output = '';
  for (const table of tables) {
    output += `--- Columns for ${db}.${table} ---\n`;
    try {
      const columns = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM ${db}.${table}`);
      output += JSON.stringify(columns, null, 2) + '\n';
    } catch (e) {
      output += `Table ${table} not found in ${db}.\n`;
    }
  }
  fs.writeFileSync('prisma/tufibra-schema.json', output);
  console.log('Inspection complete. Results in prisma/tufibra-schema.json');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
