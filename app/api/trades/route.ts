import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getISTHour, getISTDay } from "@/lib/datetime";
import { requireActiveSubscription } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol");
    const side = searchParams.get("side");
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const hourParam = searchParams.get("hour");     // 0-23
    const dayParam = searchParams.get("dayOfWeek"); // 0=Sun … 6=Sat
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "200");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: auth.user.id };
    if (symbol) where.symbol = { contains: symbol, mode: "insensitive" };
    if (side) where.side = { equals: side, mode: "insensitive" };
    if (from || to) {
      where.date = {};
      if (from) (where.date as Record<string, Date>).gte = new Date(from);
      if (to) (where.date as Record<string, Date>).lte = new Date(to);
    }

    // Hour/day-of-week filter: fetch all then filter in JS (Prisma doesn't support date part queries easily)
    let [trades, total] = await Promise.all([
      prisma.trade.findMany({ where, orderBy: { date: "desc" }, skip: 0, take: 10000 }),
      prisma.trade.count({ where }),
    ]);

    if (hourParam !== null || dayParam !== null) {
      const hour = hourParam !== null ? parseInt(hourParam) : null;
      const dow = dayParam !== null ? parseInt(dayParam) : null;
      trades = trades.filter((t) => {
        const d = new Date(t.date);
        if (hour !== null && getISTHour(d) !== hour) return false;
        if (dow !== null && getISTDay(d) !== dow) return false;
        return true;
      });
      total = trades.length;
    }

    const paged = trades.slice(skip, skip + limit);

    return NextResponse.json({ trades: paged, total, page, limit });
  } catch (error) {
    console.error("GET /api/trades error:", error);
    return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const body = await req.json();
    const {
      symbol, side, entryPrice, exitPrice, quantity, pnl, pnlPercent,
      fees, date, closeDate, exchange, notes, tags, importSource,
    } = body;

    if (!symbol || !side || !entryPrice || !quantity || !date) {
      return NextResponse.json({ error: "Missing required fields: symbol, side, entryPrice, quantity, date" }, { status: 400 });
    }

    const trade = await prisma.trade.create({
      data: {
        userId: auth.user.id,
        symbol: symbol.toUpperCase().trim(),
        side: side.toUpperCase().trim(),
        entryPrice: parseFloat(entryPrice),
        exitPrice: exitPrice ? parseFloat(exitPrice) : null,
        quantity: parseFloat(quantity),
        pnl: pnl !== undefined && pnl !== null ? parseFloat(pnl) : null,
        pnlPercent: pnlPercent !== undefined && pnlPercent !== null ? parseFloat(pnlPercent) : null,
        fees: fees ? parseFloat(fees) : 0,
        date: new Date(date),
        closeDate: closeDate ? new Date(closeDate) : null,
        exchange: exchange || null,
        notes: notes || null,
        tags: tags || null,
        importSource: importSource || "manual",
      },
    });

    return NextResponse.json(trade, { status: 201 });
  } catch (error) {
    console.error("POST /api/trades error:", error);
    return NextResponse.json({ error: "Failed to create trade" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await requireActiveSubscription(req);
    if (auth.error || !auth.user) return auth.error!;

    const { searchParams } = new URL(req.url);
    const ids = searchParams.get("ids")?.split(",");
    if (!ids || ids.length === 0) {
      return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }
    await prisma.trade.deleteMany({ where: { id: { in: ids }, userId: auth.user.id } });
    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    console.error("DELETE /api/trades error:", error);
    return NextResponse.json({ error: "Failed to delete trades" }, { status: 500 });
  }
}
