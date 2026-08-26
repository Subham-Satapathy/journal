import { Prisma, PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const client = new PrismaClient({ log: ["error"] });

  return client.$extends({
    query: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          const isColdStart = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P1001";
          if (!isColdStart) throw error;
          // Neon's free-tier compute auto-suspends after idling, so the first query
          // after a wake can fail while it's still starting up. Retry once.
          await new Promise((resolve) => setTimeout(resolve, 3000));
          return await query(args);
        }
      },
    },
  });
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
