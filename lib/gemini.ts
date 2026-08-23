// Direct REST calls to Gemini v1 API
const API_BASE = "https://generativelanguage.googleapis.com/v1";

function key() {
  return process.env.GEMINI_API_KEY ?? "";
}

// Preferred model order — matched against what /v1/models actually returns
const PREFERRED = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-lite-001",
];

let _model: string | null = null;

// One-time model resolution via the /models endpoint — no wasted quota pings
async function resolveModel(): Promise<string> {
  if (_model) return _model;

  try {
    const res = await fetch(`${API_BASE}/models?key=${key()}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message ?? `Models list failed: HTTP ${res.status}`);
    }
    const data: { models: Array<{ name: string; supportedGenerationMethods?: string[] }> } = await res.json();
    const available = (data.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
      .map((m) => m.name.replace("models/", ""));

    console.log("[Gemini] Available models:", available);

    for (const pref of PREFERRED) {
      if (available.includes(pref)) {
        console.log("[Gemini] Selected model:", pref);
        _model = pref;
        return _model;
      }
    }

    // Fall back to first available model that supports generateContent
    if (available.length > 0) {
      _model = available[0];
      console.log("[Gemini] Fallback model:", _model);
      return _model;
    }
  } catch (e) {
    console.error("[Gemini] Model resolution error:", e);
    throw e;
  }

  throw new Error("No Gemini models with generateContent support found for this API key.");
}

async function post(model: string, body: object): Promise<string> {
  const res = await fetch(`${API_BASE}/models/${model}:generateContent?key=${key()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg: string = err?.error?.message ?? `HTTP ${res.status}`;
    // If 429, add helpful context
    if (res.status === 429) {
      throw new Error(`Rate limit hit (${msg}). Free tier: 15 req/min, 1500 req/day. Wait a minute and try again.`);
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

async function generateText(prompt: string): Promise<string> {
  const model = await resolveModel();
  return post(model, {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  });
}

async function generateWithImage(prompt: string, base64Image: string, mimeType: string): Promise<string> {
  const model = await resolveModel();
  return post(model, {
    contents: [{
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: prompt },
      ],
    }],
  });
}

export async function extractTradesFromImage(base64Image: string, mimeType: string): Promise<ExtractedTrade[]> {
  const text = await generateWithImage(
    `Extract all trades from this screenshot as a JSON array. Each item:
{"symbol":"BTCUSDT","side":"LONG or SHORT or BUY or SELL","entryPrice":number,"exitPrice":number|null,"quantity":number,"pnl":number|null,"pnlPercent":number|null,"fees":number|null,"date":"ISO string","closeDate":"ISO string|null","exchange":"string|null"}
Return ONLY the JSON array, no markdown.`,
    base64Image,
    mimeType
  );
  try {
    return JSON.parse(text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")) as ExtractedTrade[];
  } catch {
    return [];
  }
}

export async function generateInsights(tradesJson: string, period: string): Promise<string> {
  return generateText(
    `You are a binary options trading coach. Every trade here is a fixed-payout contract
(CALL/PUT, UP/DOWN, HIGHER/LOWER, short expiries) — you either win a fixed payout percentage
of the stake, or lose the full stake. There is no partial exit, no trailing a winner, no
stop-loss/take-profit adjustment, and no leverage/margin to manage. Analyze this ${period}
trading data through that lens and provide:

1. **Performance Summary** — total trades, net P&L, win rate, discipline score
2. **Win Rate vs. Breakeven Edge** — the data includes \`avgPayoutPercent\` and
   \`breakevenWinRate\` (the win rate needed just to break even at that payout) and
   \`edgeVsBreakeven\`. State plainly whether the trader is beating breakeven and by how much —
   this is the single most important number in binary options, more than raw P&L for one period.
3. **Stake / Money Management** — use \`stakeEscalationRatio\` (max stake vs. average stake) to
   flag martingale-style stake doubling after losses. Comment on whether stake sizing looks flat
   and disciplined or erratic/chasing.
4. **Behavior Patterns** — overtrading (many rapid short-expiry trades in a session), revenge
   entries after a loss, and streak-driven emotional trading. Do NOT discuss holding losers,
   letting winners run, or stop-loss placement — none of that applies to fixed-expiry contracts.
5. **Timing Patterns** — best/worst hours and days of week, since binary options performance is
   very session- and volatility-dependent.
6. **Mental State Assessment** — psychological read from streaks, overtrading, and revenge entries.
7. **Actionable Recommendations** — 3-5 specific improvements framed around binary options
   practice (e.g. fixed stake % per trade, daily trade/loss caps, avoiding low-volatility hours,
   never increasing stake to "recover" a loss).
8. **Discipline Score** — 0-100 with justification.

Data: ${tradesJson}

Do NOT mention risk/reward ratio (R:R), stop-loss, take-profit, position scaling, or leverage —
none of these are relevant to fixed-payout binary options contracts.

Be data-driven and constructive. Use markdown.`
  );
}

export async function mapCsvColumns(headers: string[], sampleRows: string[][]): Promise<ColumnMapping> {
  const text = await generateText(
    `Map these CSV column headers to trade fields.
Headers: ${JSON.stringify(headers)}
Sample (3 rows): ${JSON.stringify(sampleRows)}

Return ONLY this JSON (null if no match):
{"symbol":null,"side":null,"date":null,"entryPrice":null,"exitPrice":null,"quantity":null,"pnl":null,"pnlPercent":null,"fees":null,"closeDate":null,"exchange":null,"orderId":null,"currency":null}

orderId → unique trade/order ID column. currency → USD, INR, USDT, etc.`
  );
  try {
    return JSON.parse(text.trim().replace(/^```json\n?/, "").replace(/\n?```$/, "")) as ColumnMapping;
  } catch {
    return {} as ColumnMapping;
  }
}

// Diagnostic: list all models
export async function listAvailableModels(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/models?key=${key()}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data: { models: Array<{ name: string; supportedGenerationMethods?: string[] }> } = await res.json();
  return (data.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => m.name.replace("models/", ""));
}

export interface ExtractedTrade {
  symbol: string | null; side: string | null;
  entryPrice: number | null; exitPrice: number | null;
  quantity: number | null; pnl: number | null; pnlPercent: number | null;
  fees: number | null; date: string | null; closeDate: string | null; exchange: string | null;
}
export interface ColumnMapping {
  symbol: string | null; side: string | null;
  entryPrice: string | null; exitPrice: string | null;
  quantity: string | null; pnl: string | null; pnlPercent: string | null;
  fees: string | null; date: string | null; closeDate: string | null;
  exchange: string | null; orderId: string | null; currency: string | null;
}
