import { NextResponse } from "next/server";
import { listAvailableModels } from "@/lib/gemini";

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    return NextResponse.json({ ok: false, error: "GEMINI_API_KEY not set in .env" });
  }

  try {
    const models = await listAvailableModels();
    return NextResponse.json({ ok: true, availableModels: models, count: models.length });
  } catch (e) {
    return NextResponse.json({
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      advice: "Check your API key at aistudio.google.com/apikey",
    });
  }
}
