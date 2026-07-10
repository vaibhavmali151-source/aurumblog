import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function makeClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Lazy singleton so the client isn't instantiated at import time during
// build data-collection (before `prisma generate` has run in some environments).
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  (globalForPrisma.prisma = makeClient());
