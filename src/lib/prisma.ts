import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

let dbUrl = process.env.DATABASE_URL;

// On Vercel / serverless runtime, the application bundle in /var/task is read-only.
// We copy the bundled dev.db to /tmp/dev.db (which is writable in AWS Lambda) if it doesn't exist yet.
if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
  const bundleDbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  const tmpDbPath = '/tmp/dev.db';

  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundleDbPath)) {
      fs.copyFileSync(bundleDbPath, tmpDbPath);
    }
    if (fs.existsSync(tmpDbPath)) {
      dbUrl = `file:${tmpDbPath}`;
    }
  } catch (err) {
    console.error('Failed to copy database to /tmp:', err);
  }
}

if (!dbUrl || dbUrl.startsWith('file:.')) {
  const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
  dbUrl = `file:${dbPath}`;
}

// Set process.env.DATABASE_URL for Prisma Client internals
process.env.DATABASE_URL = dbUrl;

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
