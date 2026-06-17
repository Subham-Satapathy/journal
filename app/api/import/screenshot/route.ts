import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTradesFromImage } from "@/lib/gemini";
import { parseTradeDate } from "@/lib/datetime";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const action = (formData.get("action") as string) || "extract";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 503 });
    }

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported image type. Use JPG, PNG, or WebP." }, { status: 400 });
    }

    if (action === "extract") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const extracted = await extractTradesFromImage(base64, file.type);
      return NextResponse.json({ trades: extracted });
    }

    if (action === "save") {
      const tradesJson = formData.get("trades") as string;
      if (!tradesJson) {
        return NextResponse.json({ error: "No trades data provided" }, { status: 400 });
      }

      const trades = JSON.parse(tradesJson);
      const validTrades = trades
        .filter((t: Record<string, unknown>) => t.symbol && t.side && t.entryPrice && t.date)
        .map((t: Record<string, unknown>) => ({
          symbol: String(t.symbol).toUpperCase().trim(),
          side: String(t.side).toUpperCase().trim(),
          entryPrice: parseFloat(String(t.entryPrice)),
          exitPrice: t.exitPrice ? parseFloat(String(t.exitPrice)) : null,
          quantity: t.quantity ? parseFloat(String(t.quantity)) : 1,
          pnl: t.pnl !== null && t.pnl !== undefined ? parseFloat(String(t.pnl)) : null,
          pnlPercent: t.pnlPercent !== null && t.pnlPercent !== undefined ? parseFloat(String(t.pnlPercent)) : null,
          fees: t.fees ? parseFloat(String(t.fees)) : 0,
          date: parseTradeDate(String(t.date)),
          closeDate: t.closeDate ? parseTradeDate(String(t.closeDate)) : null,
          exchange: t.exchange ? String(t.exchange) : null,
          importSource: "screenshot",
        }));

      if (validTrades.length === 0) {
        return NextResponse.json({ error: "No valid trades to save" }, { status: 400 });
      }

      await prisma.trade.createMany({ data: validTrades, skipDuplicates: true });
      return NextResponse.json({ saved: validTrades.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST /api/import/screenshot error:", error);
    return NextResponse.json({ error: "Screenshot extraction failed" }, { status: 500 });
  }
}
