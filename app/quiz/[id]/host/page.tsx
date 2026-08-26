"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trophy, Play, Lock, ArrowRight, Flag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuizState {
  id: string;
  title: string;
  status: "LOBBY" | "QUESTION_ACTIVE" | "QUESTION_LOCKED" | "FINISHED";
  currentQuestionIndex: number;
  totalQuestions: number;
  question: {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctOptionId?: string;
  } | null;
  leaderboard: { participantId: string; name: string; score: number }[];
}

const POLL_MS = 1500;

export default function QuizHostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [state, setState] = useState<QuizState | null>(null);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    const check = async () => {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = res.ok ? await res.json() : null;
      if (!data?.user?.isAdmin) {
        router.replace("/quiz");
        return;
      }
      setChecking(false);
    };
    check();
  }, [router]);

  useEffect(() => {
    if (checking) return;
    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/quiz/sessions/${id}`, { cache: "no-store" });
      if (!cancelled && res.ok) setState(await res.json());
    };
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [checking, id]);

  const advance = async (action: "start" | "lock" | "next" | "finish") => {
    setActing(true);
    try {
      const res = await fetch(`/api/quiz/sessions/${id}/advance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) setState(await res.json());
    } finally {
      setActing(false);
    }
  };

  if (checking || !state) return <div className="text-sm text-zinc-500">Loading…</div>;

  const isLastQuestion = state.currentQuestionIndex + 1 >= state.totalQuestions;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" /> {state.title}
        </h1>
        <Badge variant="info">Host</Badge>
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          {state.status === "LOBBY" && (
            <>
              <p className="text-sm text-zinc-400">
                {state.leaderboard.length} participant{state.leaderboard.length === 1 ? "" : "s"} in the lobby.
              </p>
              <Button onClick={() => advance("start")} loading={acting}>
                <Play className="w-4 h-4" /> Start quiz
              </Button>
            </>
          )}

          {state.question && state.status !== "LOBBY" && (
            <>
              <p className="text-xs text-zinc-500">
                Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
              </p>
              <h2 className="text-base font-semibold text-white">{state.question.text}</h2>
              <div className="grid gap-2 sm:grid-cols-2">
                {state.question.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={
                      "rounded-lg border px-4 py-3 text-sm " +
                      (state.status === "QUESTION_LOCKED" && state.question!.correctOptionId === opt.id
                        ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-300"
                        : "border-zinc-800 bg-zinc-950 text-zinc-300")
                    }
                  >
                    {opt.text}
                  </div>
                ))}
              </div>

              {state.status === "QUESTION_ACTIVE" && (
                <Button onClick={() => advance("lock")} loading={acting}>
                  <Lock className="w-4 h-4" /> Lock answers
                </Button>
              )}
              {state.status === "QUESTION_LOCKED" && (
                <Button onClick={() => advance("next")} loading={acting}>
                  {isLastQuestion ? (
                    <>
                      <Flag className="w-4 h-4" /> Finish quiz
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-4 h-4" /> Next question
                    </>
                  )}
                </Button>
              )}
            </>
          )}

          {state.status === "FINISHED" && <p className="text-sm text-zinc-400">Quiz finished. Final results below.</p>}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Leaderboard</h3>
          {state.leaderboard.length === 0 ? (
            <p className="text-sm text-zinc-500">No participants yet.</p>
          ) : (
            <div className="space-y-1">
              {state.leaderboard.map((p, i) => (
                <div key={p.participantId} className="flex items-center justify-between text-sm py-1">
                  <span className="text-zinc-300">
                    <span className="text-zinc-600 mr-2">#{i + 1}</span>
                    {p.name}
                  </span>
                  <span className="text-zinc-400 font-mono">{p.score}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
