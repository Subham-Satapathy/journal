import { prisma } from "@/lib/prisma";

export const LEADERBOARD_SIZE = 20;

type QuizOption = { id: string; text: string };

function computePoints(basePoints: number, timeLimitSeconds: number, elapsedMs: number) {
  const timeLimitMs = timeLimitSeconds * 1000;
  const remainingMs = Math.max(0, timeLimitMs - elapsedMs);
  return Math.round(basePoints * (0.5 + 0.5 * (remainingMs / timeLimitMs)));
}

// Deadlines are enforced lazily (no cron in this app): any read/write on a
// session first checks whether the active question's timer has run out and,
// if so, flips it to QUESTION_LOCKED before proceeding so all polling clients converge.
export async function lockExpiredQuestion(sessionId: string) {
  const session = await prisma.quizSession.findUnique({
    where: { id: sessionId },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!session) return null;

  if (session.status === "QUESTION_ACTIVE" && session.currentQuestionStartedAt) {
    const question = session.questions[session.currentQuestionIndex];
    const deadline = session.currentQuestionStartedAt.getTime() + question.timeLimitSeconds * 1000;
    if (Date.now() > deadline) {
      return prisma.quizSession.update({
        where: { id: sessionId },
        data: { status: "QUESTION_LOCKED" },
        include: { questions: { orderBy: { order: "asc" } } },
      });
    }
  }
  return session;
}

export async function getQuizState(sessionId: string, userId: string) {
  const session = await lockExpiredQuestion(sessionId);
  if (!session) return null;

  const question = session.questions[session.currentQuestionIndex] ?? null;
  const revealAnswer = session.status === "QUESTION_LOCKED" || session.status === "FINISHED";

  const [participants, myParticipant] = await Promise.all([
    prisma.quizParticipant.findMany({
      where: { sessionId },
      orderBy: { score: "desc" },
      take: LEADERBOARD_SIZE,
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.quizParticipant.findUnique({
      where: { sessionId_userId: { sessionId, userId } },
    }),
  ]);

  let myAnswer = null;
  let myRank: number | null = null;
  if (myParticipant) {
    if (question) {
      myAnswer = await prisma.quizAnswer.findUnique({
        where: { questionId_participantId: { questionId: question.id, participantId: myParticipant.id } },
      });
    }
    const higherScoreCount = await prisma.quizParticipant.count({
      where: { sessionId, score: { gt: myParticipant.score } },
    });
    myRank = higherScoreCount + 1;
  }

  const deadlineAt =
    session.status === "QUESTION_ACTIVE" && session.currentQuestionStartedAt && question
      ? session.currentQuestionStartedAt.getTime() + question.timeLimitSeconds * 1000
      : null;

  return {
    id: session.id,
    title: session.title,
    status: session.status,
    currentQuestionIndex: session.currentQuestionIndex,
    totalQuestions: session.questions.length,
    serverTime: Date.now(),
    deadlineAt,
    question: question
      ? {
          id: question.id,
          text: question.text,
          options: question.options as QuizOption[],
          timeLimitSeconds: question.timeLimitSeconds,
          correctOptionId: revealAnswer ? question.correctOptionId : undefined,
        }
      : null,
    me: myParticipant
      ? {
          joined: true,
          score: myParticipant.score,
          rank: myRank,
          hasAnsweredCurrent: Boolean(myAnswer),
          selectedOptionId: myAnswer?.selectedOptionId ?? null,
          pointsAwardedCurrent: myAnswer?.pointsAwarded ?? null,
        }
      : { joined: false },
    leaderboard: participants.map((p) => ({
      participantId: p.id,
      name: p.user.name || p.user.email,
      score: p.score,
    })),
  };
}

export async function submitAnswer(sessionId: string, userId: string, selectedOptionId: string) {
  const session = await lockExpiredQuestion(sessionId);
  if (!session) return { error: "Session not found" as const, status: 404 };
  if (session.status !== "QUESTION_ACTIVE" || !session.currentQuestionStartedAt) {
    return { error: "Question is not currently active" as const, status: 409 };
  }

  const question = session.questions[session.currentQuestionIndex];
  const elapsedMs = Date.now() - session.currentQuestionStartedAt.getTime();

  const participant = await prisma.quizParticipant.findUnique({
    where: { sessionId_userId: { sessionId, userId } },
  });
  if (!participant) return { error: "Join the session before answering" as const, status: 403 };

  const isCorrect = selectedOptionId === question.correctOptionId;
  const pointsAwarded = isCorrect ? computePoints(question.basePoints, question.timeLimitSeconds, elapsedMs) : 0;

  try {
    await prisma.$transaction([
      prisma.quizAnswer.create({
        data: {
          sessionId,
          questionId: question.id,
          participantId: participant.id,
          selectedOptionId,
          isCorrect,
          pointsAwarded,
        },
      }),
      prisma.quizParticipant.update({
        where: { id: participant.id },
        data: { score: { increment: pointsAwarded } },
      }),
    ]);
  } catch {
    return { error: "Already answered this question" as const, status: 409 };
  }

  return { error: null, isCorrect, pointsAwarded };
}
