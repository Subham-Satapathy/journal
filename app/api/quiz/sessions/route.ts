import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser, requireAdmin } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const sessions = await prisma.quizSession.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { participants: true, questions: true } },
      },
    });

    return NextResponse.json(
      sessions.map((s) => ({
        id: s.id,
        title: s.title,
        status: s.status,
        participantCount: s._count.participants,
        questionCount: s._count.questions,
        createdAt: s.createdAt,
      }))
    );
  } catch (error) {
    console.error("GET /api/quiz/sessions error:", error);
    return NextResponse.json({ error: "Failed to load quiz sessions" }, { status: 500 });
  }
}

interface CreateQuestionInput {
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  timeLimitSeconds?: number;
  basePoints?: number;
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error || !auth.user) return auth.error!;

    const body = await req.json();
    const title = String(body.title || "").trim();
    const questions: CreateQuestionInput[] = Array.isArray(body.questions) ? body.questions : [];

    if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (questions.length === 0) {
      return NextResponse.json({ error: "At least one question is required" }, { status: 400 });
    }
    for (const q of questions) {
      if (!q.text?.trim() || !Array.isArray(q.options) || q.options.length < 2) {
        return NextResponse.json({ error: "Each question needs text and at least 2 options" }, { status: 400 });
      }
      if (!q.options.some((o) => o.id === q.correctOptionId)) {
        return NextResponse.json({ error: "correctOptionId must match one of the options" }, { status: 400 });
      }
    }

    const session = await prisma.quizSession.create({
      data: {
        title,
        hostId: auth.user.id,
        questions: {
          create: questions.map((q, i) => ({
            order: i,
            text: q.text.trim(),
            options: q.options,
            correctOptionId: q.correctOptionId,
            timeLimitSeconds: q.timeLimitSeconds || 20,
            basePoints: q.basePoints || 1000,
          })),
        },
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error("POST /api/quiz/sessions error:", error);
    return NextResponse.json({ error: "Failed to create quiz session" }, { status: 500 });
  }
}
