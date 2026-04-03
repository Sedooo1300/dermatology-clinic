import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./db/custom.db'

  // Check if using remote Turso or local file
  const isRemote = dbUrl.startsWith('libsql://') || dbUrl.startsWith('https://')

  if (isRemote) {
    // Remote Turso database - use libSQL adapter
    const adapter = new PrismaLibSQL({ url: dbUrl })
    return new PrismaClient({ adapter })
  } else {
    // Local SQLite file (development)
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
