
import { PrismaClient } from '../lib/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    const dbs: any[] = await prisma.$queryRawUnsafe('SHOW DATABASES');
    for (const dbObj of dbs) {
      const db = dbObj.Database || dbObj.SCHEMA_NAME;
      if (['information_schema', 'mysql', 'performance_schema', 'sys'].includes(db)) continue;
      
      console.log(`Checking database: ${db}`);
      try {
        const tables: any[] = await prisma.$queryRawUnsafe(`SHOW TABLES FROM ${db}`);
        const tableNames = tables.map(t => Object.values(t)[0]);
        if (tableNames.includes('cliente')) {
          console.log(`FOUND 'cliente' in database: ${db}`);
          const columns = await prisma.$queryRawUnsafe(`SHOW COLUMNS FROM ${db}.cliente`);
          console.log(JSON.stringify(columns, null, 2));
        }
      } catch (e) {
        console.error(`Error checking db ${db}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Error:', e);
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
