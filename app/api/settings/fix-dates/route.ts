import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * One-time fix: trades imported before IST parsing stored wall-clock times as UTC.
 * Subtracts 5:30 from all trade dates. Run only once.
 */
export async function POST() {
  try {
    const updated = await prisma.$executeRaw`
      UPDATE "Trade"
      SET
        date = date - INTERVAL '5 hours 30 minutes',
        "closeDate" = CASE
          WHEN "closeDate" IS NOT NULL THEN "closeDate" - INTERVAL '5 hours 30 minutes'
          ELSE NULL
        END
    `;

    return NextResponse.json({ ok: true, updated: Number(updated) });
  } catch (error) {
    console.error("POST /api/settings/fix-dates error:", error);
    return NextResponse.json({ error: "Failed to fix dates" }, { status: 500 });
  }
}
