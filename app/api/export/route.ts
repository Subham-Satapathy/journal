import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { formatDateTimeISTExport, getISTDateKey } from "@/lib/datetime";
import { requireActiveSubscription } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const where: Record<string, unknown> = { userId: auth.user.id };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    const trades = await prisma.trade.findMany({ where, orderBy: { date: "desc" } });

    const headers = ["Date", "Symbol", "Side", "Entry Price", "Exit Price", "Quantity", "P&L", "P&L %", "Fees", "Exchange", "Tags", "Notes"];
    const rows = trades.map((t) => [
      formatDateTimeISTExport(new Date(t.date)),
      t.symbol,
      t.side,
      t.entryPrice,
      t.exitPrice ?? "",
      t.quantity,
      t.pnl ?? "",
      t.pnlPercent ?? "",
      t.fees,
      t.exchange ?? "",
      t.tags ?? "",
      t.notes ?? "",
    ]);

    const csv = [headers, ...rows].map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="trades-${getISTDateKey(new Date())}.csv"`,
      },
    });
  } catch (error) {
    console.error("GET /api/export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
