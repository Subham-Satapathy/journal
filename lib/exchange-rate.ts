let cache: { rate: number; fetchedAt: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function fetchUsdInrRate(): Promise<number> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rate;
  }

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
        return rate;
      }
    }
  } catch { /* fallback */ }

  try {
    const res2 = await fetch("https://open.er-api.com/v6/latest/USD");
    if (res2.ok) {
      const data2 = await res2.json();
      const rate = data2?.rates?.INR;
      if (rate && typeof rate === "number") {
        cache = { rate, fetchedAt: Date.now() };
        return rate;
      }
    }
  } catch { /* fallback */ }

  return cache?.rate ?? 84.5;
}

export function getCachedRateMeta() {
  return cache;
}
