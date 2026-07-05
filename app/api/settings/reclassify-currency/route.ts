import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * One-time recovery for legacy imports where INR rows were stored as USDT.
 * Heuristic: small qty/small pnl => USD account row, otherwise INR row.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const usdMaxQty = Number(body?.usdMaxQty ?? 20);
    const usdMaxAbsPnl = Number(body?.usdMaxAbsPnl ?? 25);
    const dryRun = Boolean(body?.dryRun);

    const where = { currency: "USDT" as const };
    const candidates = await prisma.trade.findMany({
      where,
      select: { id: true, quantity: true, pnl: true },
    });

    const usdIds: string[] = [];
    const inrIds: string[] = [];
    for (const t of candidates) {
      const absPnl = Math.abs(t.pnl ?? 0);
      const looksUsd = t.quantity <= usdMaxQty && absPnl <= usdMaxAbsPnl;
      if (looksUsd) usdIds.push(t.id);
      else inrIds.push(t.id);
    }

    if (!dryRun) {
      if (usdIds.length > 0) {
        await prisma.trade.updateMany({ where: { id: { in: usdIds } }, data: { currency: "USDT" } });
      }
      if (inrIds.length > 0) {
        await prisma.trade.updateMany({ where: { id: { in: inrIds } }, data: { currency: "INR" } });
      }
    }

    return NextResponse.json({
      ok: true,
      dryRun,
      thresholds: { usdMaxQty, usdMaxAbsPnl },
      examined: candidates.length,
      classifiedUsd: usdIds.length,
      classifiedInr: inrIds.length,
      updated: dryRun ? 0 : candidates.length,
    });
  } catch (error) {
    console.error("POST /api/settings/reclassify-currency error:", error);
    return NextResponse.json({ error: "Failed to reclassify currencies" }, { status: 500 });
  }
}
