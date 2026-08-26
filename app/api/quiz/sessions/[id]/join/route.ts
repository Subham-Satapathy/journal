import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";
import { getQuizState } from "@/lib/quiz";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const session = await prisma.quizSession.findUnique({ where: { id } });
    if (!session) return NextResponse.json({ error: "Quiz session not found" }, { status: 404 });

    await prisma.quizParticipant.upsert({
      where: { sessionId_userId: { sessionId: id, userId: auth.user.id } },
      update: {},
      create: { sessionId: id, userId: auth.user.id },
    });

    const state = await getQuizState(id, auth.user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error("POST /api/quiz/sessions/[id]/join error:", error);
    return NextResponse.json({ error: "Failed to join quiz session" }, { status: 500 });
  }
}
