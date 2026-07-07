import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { recomputeDailyPnlForUser } from "@/lib/daily-pnl";

/**
 * Fix dates imported with UTC (Z) when broker sheet uses UTC+2.
 * Subtracts 2 hours to restore true UTC instants. Run only once.
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const trades = await prisma.trade.findMany({
      where: { userId: auth.user.id },
      select: { id: true, date: true, closeDate: true },
    });

    let updated = 0;
    for (const trade of trades) {
      await prisma.trade.update({
        where: { id: trade.id },
        data: {
          date: new Date(trade.date.getTime() - 2 * 60 * 60 * 1000),
          closeDate: trade.closeDate
            ? new Date(trade.closeDate.getTime() - 2 * 60 * 60 * 1000)
            : null,
        },
      });
      updated += 1;
    }
    await recomputeDailyPnlForUser(auth.user.id);

    return NextResponse.json({ ok: true, updated });
  } catch (error) {
    console.error("POST /api/settings/fix-dates error:", error);
    return NextResponse.json({ error: "Failed to fix dates" }, { status: 500 });
  }
}
