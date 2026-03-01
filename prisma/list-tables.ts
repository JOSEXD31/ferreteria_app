import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Listing tables...')
  try {
    const tables: any[] = await prisma.$queryRaw`SHOW TABLES`
    console.log('Tables in DB:', JSON.stringify(tables, null, 2))
  } catch (err) {
    console.error('Failed to list tables:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
