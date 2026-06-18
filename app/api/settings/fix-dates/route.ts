import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Fix dates imported with UTC (Z) when broker sheet uses UTC+2.
 * Subtracts 2 hours to restore true UTC instants. Run only once.
 */
export async function POST() {
  try {
    const updated = await prisma.$executeRaw`
      UPDATE "Trade"
      SET
        date = date - INTERVAL '2 hours',
        "closeDate" = CASE
          WHEN "closeDate" IS NOT NULL THEN "closeDate" - INTERVAL '2 hours'
          ELSE NULL
        END
    `;

    return NextResponse.json({ ok: true, updated: Number(updated) });
  } catch (error) {
    console.error("POST /api/settings/fix-dates error:", error);
    return NextResponse.json({ error: "Failed to fix dates" }, { status: 500 });
  }
}
