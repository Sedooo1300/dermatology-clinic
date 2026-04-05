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
    // Remote Turso database - PrismaLibSQL takes Config{url} not Client
    console.log('[DB] Using remote Turso database')
    const adapter = new PrismaLibSQL({ url: dbUrl })
    return new PrismaClient({ adapter })
  } else {
    // Local SQLite file (development)
    console.log('[DB] Using local SQLite:', dbUrl)
    return new PrismaClient({
      log: ['error', 'warn'],
    })
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
