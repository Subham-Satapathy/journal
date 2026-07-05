import { NextResponse } from "next/server";
import { fetchUsdInrRate, getCachedRateMeta } from "@/lib/exchange-rate";

export async function GET() {
  try {
    const rate = await fetchUsdInrRate();
    const cache = getCachedRateMeta();
    return NextResponse.json({
      rate,
      source: cache ? "live" : "fallback",
      fetchedAt: cache?.fetchedAt ?? Date.now(),
    });
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    const cache = getCachedRateMeta();
    return NextResponse.json({ rate: cache?.rate ?? 84.5, source: "error-fallback", fetchedAt: Date.now() });
  }
}
