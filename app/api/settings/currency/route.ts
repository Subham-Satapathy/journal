import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Update ALL trades to a given currency (bulk migration)
export async function POST(req: NextRequest) {
  try {
    const { currency } = await req.json();
    if (currency !== "INR" && currency !== "USDT") {
      return NextResponse.json({ error: "Currency must be INR or USDT" }, { status: 400 });
    }
    const result = await prisma.trade.updateMany({ data: { currency } });
    return NextResponse.json({ updated: result.count, currency });
  } catch (error) {
    console.error("Currency update error:", error);
    return NextResponse.json({ error: "Failed to update currency" }, { status: 500 });
  }
}

// Auto-detect currency from trade data (heuristic)
export async function GET() {
  try {
    const sample = await prisma.trade.findMany({
      where: { pnl: { not: null } },
      take: 20,
      select: { pnl: true, quantity: true },
    });
    if (sample.length === 0) return NextResponse.json({ detected: "USDT" });

    const avgPnl = sample.reduce((a, t) => a + Math.abs(t.pnl ?? 0), 0) / sample.length;
    const avgQty = sample.reduce((a, t) => a + Math.abs(t.quantity ?? 0), 0) / sample.length;

    // INR trades typically have larger round numbers (>100 for pnl, >500 for qty)
    // USDT crypto trades typically have pnl < 100 for retail traders
    const likelyINR = avgPnl > 100 || avgQty > 200;
    return NextResponse.json({ detected: likelyINR ? "INR" : "USDT", avgPnl, avgQty });
  } catch (error) {
    return NextResponse.json({ detected: "USDT" });
  }
}
