"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { Trophy, Check, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizOption {
  id: string;
  text: string;
}

interface QuizState {
  id: string;
  title: string;
  status: "LOBBY" | "QUESTION_ACTIVE" | "QUESTION_LOCKED" | "FINISHED";
  currentQuestionIndex: number;
  totalQuestions: number;
  serverTime: number;
  deadlineAt: number | null;
  question: {
    id: string;
    text: string;
    options: QuizOption[];
    timeLimitSeconds: number;
    correctOptionId?: string;
  } | null;
  me:
    | {
        joined: true;
        score: number;
        rank: number | null;
        hasAnsweredCurrent: boolean;
        selectedOptionId: string | null;
        pointsAwardedCurrent: number | null;
      }
    | { joined: false };
  leaderboard: { participantId: string; name: string; score: number }[];
}

const POLL_MS = 1500;

export default function QuizPlayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [state, setState] = useState<QuizState | null>(null);
  const [remainingMs, setRemainingMs] = useState(0);
  const [joining, setJoining] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const clockOffsetRef = useRef(0); // serverTime - Date.now(), from the latest poll

  const applyState = useCallback((s: QuizState) => {
    clockOffsetRef.current = s.serverTime - Date.now();
    setState(s);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/quiz/sessions/${id}`, { cache: "no-store" });
      if (!res.ok || cancelled) return;
      applyState(await res.json());
    };
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [id, applyState]);

  useEffect(() => {
    const tick = () => {
      if (!state?.deadlineAt) {
        setRemainingMs(0);
        return;
      }
      const now = Date.now() + clockOffsetRef.current;
      setRemainingMs(Math.max(0, state.deadlineAt - now));
    };
    tick();
    const interval = setInterval(tick, 200);
    return () => clearInterval(interval);
  }, [state?.deadlineAt]);

  const join = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/quiz/sessions/${id}/join`, { method: "POST" });
      if (res.ok) applyState(await res.json());
    } finally {
      setJoining(false);
    }
  };

  const answer = async (optionId: string) => {
    if (submitting || state?.me.joined === false || state?.me.hasAnsweredCurrent) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/quiz/sessions/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedOptionId: optionId }),
      });
      if (res.ok) applyState(await res.json());
    } finally {
      setSubmitting(false);
    }
  };

  if (!state) return <div className="text-sm text-zinc-500">Loading…</div>;

  const me = state.me;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-400" /> {state.title}
        </h1>
        {state.question && (
          <p className="text-sm text-zinc-500 mt-0.5">
            Question {state.currentQuestionIndex + 1} of {state.totalQuestions}
          </p>
        )}
      </div>

      {!me.joined ? (
        <Card>
          <CardContent className="py-8 text-center space-y-3">
            <p className="text-sm text-zinc-400">Join to play along and appear on the leaderboard.</p>
            <Button onClick={join} loading={joining}>
              Join session
            </Button>
          </CardContent>
        </Card>
      ) : state.status === "LOBBY" ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-400">
            You&apos;re in! Waiting for the host to start…
          </CardContent>
        </Card>
      ) : state.status === "FINISHED" ? (
        <Card>
          <CardContent className="py-8 text-center space-y-1">
            <p className="text-sm text-zinc-400">Final score</p>
            <p className="text-3xl font-bold text-white">{me.score}</p>
            {me.rank && <p className="text-sm text-zinc-500">Rank #{me.rank}</p>}
          </CardContent>
        </Card>
      ) : state.question ? (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">{state.question.text}</h2>
              {state.status === "QUESTION_ACTIVE" && (
                <span className="text-sm font-mono text-indigo-400">{Math.ceil(remainingMs / 1000)}s</span>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {state.question.options.map((opt) => {
                const isSelected = me.selectedOptionId === opt.id;
                const isCorrectOpt = state.question!.correctOptionId === opt.id;
                const revealed = state.status === "QUESTION_LOCKED";
                return (
                  <button
                    key={opt.id}
                    disabled={me.hasAnsweredCurrent || state.status !== "QUESTION_ACTIVE" || submitting}
                    onClick={() => answer(opt.id)}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm text-left transition-colors",
                      revealed && isCorrectOpt
                        ? "border-emerald-600/40 bg-emerald-600/10 text-emerald-300"
                        : revealed && isSelected
                        ? "border-red-600/40 bg-red-600/10 text-red-300"
                        : isSelected
                        ? "border-indigo-600 bg-indigo-600/10 text-white"
                        : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-700",
                      "disabled:cursor-not-allowed"
                    )}
                  >
                    {opt.text}
                    {revealed && isCorrectOpt && <Check className="w-4 h-4" />}
                    {revealed && isSelected && !isCorrectOpt && <X className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>

            {state.status === "QUESTION_LOCKED" && (
              <div className="text-sm text-zinc-400">
                {me.pointsAwardedCurrent ? (
                  <span className="text-emerald-400">+{me.pointsAwardedCurrent} points</span>
                ) : (
                  <span>No points this round</span>
                )}
                {" · "}Score: {me.score}
                {me.rank && <> · Rank #{me.rank}</>}
              </div>
            )}
            {me.hasAnsweredCurrent && state.status === "QUESTION_ACTIVE" && (
              <div className="text-xs text-zinc-500">Answer locked in — waiting for the timer…</div>
            )}
          </CardContent>
        </Card>
      ) : null}

      {me.joined && state.leaderboard.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Leaderboard</h3>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
