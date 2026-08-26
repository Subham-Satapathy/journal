"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface OptionDraft {
  id: string;
  text: string;
}

interface QuestionDraft {
  text: string;
  options: OptionDraft[];
  correctOptionId: string;
  timeLimitSeconds: number;
}

function newOption(index: number): OptionDraft {
  return { id: `opt-${index}-${Date.now()}`, text: "" };
}

function newQuestion(): QuestionDraft {
  const options = [newOption(0), newOption(1)];
  return { text: "", options, correctOptionId: options[0].id, timeLimitSeconds: 20 };
}

export default function NewQuizPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const updateQuestion = (qi: number, patch: Partial<QuestionDraft>) => {
    setQuestions((prev) => prev.map((q, i) => (i === qi ? { ...q, ...patch } : q)));
  };

  const updateOption = (qi: number, oi: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi ? { ...q, options: q.options.map((o, j) => (j === oi ? { ...o, text } : o)) } : q))
    );
  };

  const addOption = (qi: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qi && q.options.length < 4 ? { ...q, options: [...q.options, newOption(q.options.length)] } : q))
    );
  };

  const removeOption = (qi: number, oi: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi || q.options.length <= 2) return q;
        const options = q.options.filter((_, j) => j !== oi);
        const correctOptionId = q.correctOptionId === q.options[oi].id ? options[0].id : q.correctOptionId;
        return { ...q, options, correctOptionId };
      })
    );
  };

  const addQuestion = () => setQuestions((prev) => [...prev, newQuestion()]);
  const removeQuestion = (qi: number) => setQuestions((prev) => prev.filter((_, i) => i !== qi));

  const submit = async () => {
    setError(null);
    if (!title.trim()) return setError("Give the session a title.");
    for (const q of questions) {
      if (!q.text.trim()) return setError("Every question needs text.");
      if (q.options.some((o) => !o.text.trim())) return setError("Every option needs text.");
    }

    setSaving(true);
    try {
      const res = await fetch("/api/quiz/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), questions }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create session");
        return;
      }
      router.push(`/quiz/${data.id}/host`);
    } finally {
      setSaving(false);
    }
  };

  if (checking) return <div className="text-sm text-zinc-500">Loading…</div>;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white">New quiz session</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Add questions, then start the session from the host screen</p>
      </div>

      <Card>
        <CardContent className="pt-4">
          <label className="text-xs text-zinc-500">Session title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Friday Trading Trivia"
            className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-600"
          />
        </CardContent>
      </Card>

      {questions.map((q, qi) => (
        <Card key={qi}>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Question {qi + 1}</CardTitle>
            {questions.length > 1 && (
              <button onClick={() => removeQuestion(qi)} className="text-zinc-600 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </CardHeader>
          <CardContent className="pt-3 space-y-3">
            <input
              value={q.text}
              onChange={(e) => updateQuestion(qi, { text: e.target.value })}
              placeholder="Question text"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-600"
            />

            <div className="space-y-2">
              {q.options.map((o, oi) => (
                <div key={o.id} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name={`correct-${qi}`}
                    checked={q.correctOptionId === o.id}
                    onChange={() => updateQuestion(qi, { correctOptionId: o.id })}
                    className="accent-indigo-600"
                  />
                  <input
                    value={o.text}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                    placeholder={`Option ${oi + 1}`}
                    className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-indigo-600"
                  />
                  {q.options.length > 2 && (
                    <button onClick={() => removeOption(qi, oi)} className="text-zinc-600 hover:text-red-400">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {q.options.length < 4 && (
                <button onClick={() => addOption(qi)} className="text-xs text-indigo-400 hover:text-indigo-300">
                  + Add option
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">Time limit (seconds)</label>
              <input
                type="number"
                min={5}
                max={120}
                value={q.timeLimitSeconds}
                onChange={(e) => updateQuestion(qi, { timeLimitSeconds: Number(e.target.value) || 20 })}
                className="w-20 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-sm text-white focus:outline-none focus:border-indigo-600"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <button
        onClick={addQuestion}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-zinc-800 text-sm text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
      >
        <Plus className="w-4 h-4" /> Add question
      </button>

      {error && <div className="text-sm text-red-400">{error}</div>}

      <Button onClick={submit} loading={saving} className="w-full">
        Create session
      </Button>
    </div>
  );
}
