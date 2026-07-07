import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getISTDateKey } from "@/lib/datetime";

type DailyPnlClient = PrismaClient | Prisma.TransactionClient;

export async function recomputeDailyPnlForUser(
  userId: string,
  client: DailyPnlClient = prisma
) {
  const closedTrades = await client.trade.findMany({
    where: { userId, pnl: { not: null } },
    select: { pnl: true, date: true, closeDate: true },
  });

  const dailyMap = new Map<string, { pnl: number; tradeCount: number }>();
  for (const t of closedTrades) {
    const dayKey = getISTDateKey(new Date(t.closeDate ?? t.date));
    const prev = dailyMap.get(dayKey) ?? { pnl: 0, tradeCount: 0 };
    dailyMap.set(dayKey, {
      pnl: prev.pnl + (t.pnl ?? 0),
      tradeCount: prev.tradeCount + 1,
    });
  }

  await client.dailyPnl.deleteMany({ where: { userId } });
  if (dailyMap.size === 0) return;

  await client.dailyPnl.createMany({
    data: [...dailyMap.entries()].map(([date, value]) => ({
      userId,
      date,
      pnl: value.pnl,
      tradeCount: value.tradeCount,
    })),
  });
}
