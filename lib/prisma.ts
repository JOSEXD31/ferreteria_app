import { PrismaClient } from "./generated/prisma"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query"], // Opcional: puedes quitar esto en producción
    datasources: {
      db: {
        url: process.env.DATABASE_URL, // Aquí se asegura que use tu nodo remoto
      },
    },
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
