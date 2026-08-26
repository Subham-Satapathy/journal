import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { submitAnswer, getQuizState } from "@/lib/quiz";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const body = await req.json();
    const selectedOptionId = String(body.selectedOptionId || "");
    if (!selectedOptionId) {
      return NextResponse.json({ error: "selectedOptionId is required" }, { status: 400 });
    }

    const result = await submitAnswer(id, auth.user.id, selectedOptionId);
    if (result.error) return NextResponse.json({ error: result.error }, { status: result.status });

    const state = await getQuizState(id, auth.user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error("POST /api/quiz/sessions/[id]/answer error:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
