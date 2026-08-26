import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/api-auth";
import { getQuizState, lockExpiredQuestion } from "@/lib/quiz";

type Action = "start" | "lock" | "next" | "finish";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error || !auth.user) return auth.error!;

    const { id } = await params;
    const body = await req.json();
    const action = body.action as Action;

    const session = await lockExpiredQuestion(id);
    if (!session) return NextResponse.json({ error: "Quiz session not found" }, { status: 404 });
    if (session.hostId !== auth.user.id) {
      return NextResponse.json({ error: "Only the host can control this session" }, { status: 403 });
    }

    if (action === "start") {
      if (session.status !== "LOBBY") {
        return NextResponse.json({ error: "Session already started" }, { status: 409 });
      }
      await prisma.quizSession.update({
        where: { id },
        data: { status: "QUESTION_ACTIVE", currentQuestionIndex: 0, currentQuestionStartedAt: new Date() },
      });
    } else if (action === "lock") {
      if (session.status !== "QUESTION_ACTIVE") {
        return NextResponse.json({ error: "No active question to lock" }, { status: 409 });
      }
      await prisma.quizSession.update({ where: { id }, data: { status: "QUESTION_LOCKED" } });
    } else if (action === "next") {
      if (session.status !== "QUESTION_LOCKED") {
        return NextResponse.json({ error: "Lock the current question before advancing" }, { status: 409 });
      }
      const nextIndex = session.currentQuestionIndex + 1;
      if (nextIndex >= session.questions.length) {
        await prisma.quizSession.update({ where: { id }, data: { status: "FINISHED" } });
      } else {
        await prisma.quizSession.update({
          where: { id },
          data: { status: "QUESTION_ACTIVE", currentQuestionIndex: nextIndex, currentQuestionStartedAt: new Date() },
        });
      }
    } else if (action === "finish") {
      await prisma.quizSession.update({ where: { id }, data: { status: "FINISHED" } });
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const state = await getQuizState(id, auth.user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error("POST /api/quiz/sessions/[id]/advance error:", error);
    return NextResponse.json({ error: "Failed to advance quiz session" }, { status: 500 });
  }
}
