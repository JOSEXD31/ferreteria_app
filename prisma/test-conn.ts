import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Testing connection...')
  try {
    const users = await prisma.usuario.findMany()
    console.log('Users in DB:', users.length)
  } catch (err) {
    console.error('Connection failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
