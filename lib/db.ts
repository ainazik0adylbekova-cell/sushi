import { PrismaClient } from "@prisma/client";

// Предотвращаем создание множества соединений в dev-режиме из-за hot reload
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL environment variable before instantiating Prisma Client
// This provides clear, actionable error messages when DATABASE_URL is missing or empty
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === '') {
  const errorMessage = 
    'DATABASE_URL environment variable is missing or empty. ' +
    'Please configure DATABASE_URL in your .env file. ' +
    'Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require';
  
  // Log to console for server logs visibility
  console.error('❌ Database Configuration Error:', errorMessage);
  
  // Throw error to fail fast
  throw new Error(errorMessage);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
