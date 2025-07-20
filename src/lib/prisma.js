/**
 * Prisma Database Client
 * Singleton pattern untuk koneksi database yang optimal
 */

import { PrismaClient } from '@prisma/client';

/**
 * Global Prisma client instance
 * @type {PrismaClient}
 */
let prisma;

/**
 * Initialize Prisma client dengan konfigurasi optimal
 * @returns {PrismaClient}
 */
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
}

// Singleton pattern untuk development (prevent hot reload issues)
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

export default prisma;

/**
 * Graceful shutdown - disconnect database pada app termination
 */
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error);
  }
}
