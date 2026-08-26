"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuizSessionSummary {
  id: string;
  title: string;
  status: string;
  participantCount: number;
  questionCount: number;
  createdAt: string;
}

const STATUS_VARIANT: Record<string, "default" | "success" | "info" | "warning"> = {
  LOBBY: "info",
  QUESTION_ACTIVE: "success",
  QUESTION_LOCKED: "warning",
  FINISHED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  LOBBY: "Open to join",
  QUESTION_ACTIVE: "Live now",
  QUESTION_LOCKED: "Live now",
  FINISHED: "Finished",
};

export default function QuizListPage() {
  const [sessions, setSessions] = useState<QuizSessionSummary[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sessionsRes, meRes] = await Promise.all([
          fetch("/api/quiz/sessions", { cache: "no-store" }),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);
        if (sessionsRes.ok) setSessions(await sessionsRes.json());
        if (meRes.ok) {
          const me = await meRes.json();
          setIsAdmin(Boolean(me?.user?.isAdmin));
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-400" /> Quiz
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Join a live quiz and climb the leaderboard</p>
        </div>
        {isAdmin && (
          <Link href="/quiz/new">
            <Button size="sm">
              <Plus className="w-4 h-4" /> New session
            </Button>
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-zinc-500">Loading…</div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-zinc-500">
            No quiz sessions yet. Check back soon.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sessions.map((s) => {
            const href = isAdmin ? `/quiz/${s.id}/host` : `/quiz/${s.id}`;
            return (
              <Link key={s.id} href={href}>
                <Card className="hover:border-zinc-700 transition-colors h-full">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <h2 className="text-sm font-semibold text-white truncate">{s.title}</h2>
                      <Badge variant={STATUS_VARIANT[s.status] ?? "default"}>
                        {STATUS_LABEL[s.status] ?? s.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {s.questionCount} question{s.questionCount === 1 ? "" : "s"} · {s.participantCount} joined
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
