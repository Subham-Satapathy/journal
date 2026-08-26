import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getQuizState } from "@/lib/quiz";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const state = await getQuizState(id, auth.user.id);
    if (!state) return NextResponse.json({ error: "Quiz session not found" }, { status: 404 });

    return NextResponse.json(state);
  } catch (error) {
    console.error("GET /api/quiz/sessions/[id] error:", error);
    return NextResponse.json({ error: "Failed to load quiz session" }, { status: 500 });
  }
}
