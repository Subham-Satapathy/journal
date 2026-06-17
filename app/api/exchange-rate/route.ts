import { NextResponse } from "next/server";

// Simple in-memory cache — avoids hammering external API on every dashboard refresh
let cache: { rate: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached rate if still fresh
    if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json({ rate: cache.rate, source: "cache", fetchedAt: cache.fetchedAt });
    }

    // Primary: CoinGecko — USDT price in INR
    try {
      const res = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr",
        { next: { revalidate: 300 } }
      );
      if (res.ok) {
        const data = await res.json();
        const rate = data?.tether?.inr;
        if (rate && typeof rate === "number") {
          cache = { rate, fetchedAt: Date.now() };
          return NextResponse.json({ rate, source: "coingecko", fetchedAt: cache.fetchedAt });
        }
      }
    } catch {
      // fallthrough to backup
    }

    // Backup: exchangerate-api (USD ≈ USDT)
    const res2 = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res2.ok) {
      const data2 = await res2.json();
      const rate = data2?.rates?.INR;
      if (rate && typeof rate === "number") {
        cache = { rate, fetchedAt: Date.now() };
        return NextResponse.json({ rate, source: "exchangerate-api", fetchedAt: cache.fetchedAt });
      }
    }

    // Final fallback: use last cached value or hardcoded approximate
    if (cache) {
      return NextResponse.json({ rate: cache.rate, source: "stale-cache", fetchedAt: cache.fetchedAt });
    }

    return NextResponse.json({ rate: 84.5, source: "fallback", fetchedAt: Date.now() });
  } catch (error) {
    console.error("Exchange rate fetch failed:", error);
    return NextResponse.json({ rate: cache?.rate ?? 84.5, source: "error-fallback", fetchedAt: Date.now() });
  }
}
