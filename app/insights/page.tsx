"use client";

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, Clock, TrendingUp, AlertCircle, FlaskConical, CheckCircle2, XCircle } from "lucide-react";
import { useCurrency } from "@/lib/currency-context";

function DiagnosePanel() {
  const [result, setResult] = useState<{
    ok: boolean; workingModel: string | null; results: Record<string, string>; advice: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai-test");
      setResult(await res.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { run(); }, []);

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-amber-400" />
        <span className="text-sm font-semibold text-amber-300">AI API Diagnostics</span>
        {loading && <span className="text-xs text-zinc-500">Running tests...</span>}
      </div>

      {result && (
        <>
          <div className="space-y-1.5">
            {Object.entries(result.results).map(([model, status]) => (
              <div key={model} className="flex items-start sm:items-center gap-2 text-xs">
                {status.startsWith("✅") ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                )}
                <span className="text-zinc-300 font-mono sm:w-44 break-all sm:break-normal sm:truncate flex-shrink-0">{model}</span>
                <span className={status.startsWith("✅") ? "text-emerald-400" : "text-red-400/80"}>{status}</span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 whitespace-pre-wrap">
            {result.advice}
          </div>

          {!result.ok && (
            <div className="space-y-2 text-xs text-zinc-400">
              <p className="font-semibold text-white">Quick fix steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Go to <a href="https://aistudio.google.com/apikey" target="_blank" className="text-indigo-400 underline">aistudio.google.com/apikey</a></li>
                <li>Click <strong className="text-white">Create API key</strong> → choose a <strong className="text-white">personal Google project</strong> (not Workspace)</li>
                <li>Copy the new key and replace <code className="bg-zinc-800 px-1 rounded">GEMINI_API_KEY</code> in your <code className="bg-zinc-800 px-1 rounded">.env</code> file</li>
                <li>Restart the server: stop and run <code className="bg-zinc-800 px-1 rounded">npm run dev</code> again</li>
              </ol>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type Period = "day" | "week" | "month" | "quarter";

const PERIOD_LABELS: Record<Period, string> = {
  day: "Last 1 day",
  week: "Last 7 days",
  month: "Last 30 days",
  quarter: "Last 90 days",
};

function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose-dark text-sm leading-7 text-zinc-300">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

export default function InsightsPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { displayCurrency, rate } = useCurrency();

  const generate = async () => {
    setLoading(true);
    setError(null);
    setInsights(null);
    try {
      const res = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period, currency: displayCurrency, rate }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setInsights(data.insights);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("No Gemini models")) {
        setError("__DIAGNOSE__");
      } else if (msg.includes("401") || msg.includes("403") || msg.includes("API_KEY")) {
        setError("Invalid AI API key. Get a valid key at aistudio.google.com/apikey and add it to your .env file.");
      } else {
        setError(`AI request failed: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Insights</h1>
        <p className="text-sm text-zinc-500 mt-0.5">AI-powered trading analysis and recommendations</p>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="w-full sm:w-auto overflow-x-auto">
              <div className="inline-flex min-w-max items-center gap-1 bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([p, label]) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                    period === p ? "bg-indigo-600 text-white" : "text-zinc-400 hover:text-white disabled:opacity-50"
                  }`}
                >
                  {label}
                </button>
              ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={generate} loading={loading} className="gap-2">
                <Sparkles className="w-4 h-4" />
                {loading ? "Analyzing..." : "Generate AI Insights"}
              </Button>
              {loading && (
                <span className="text-xs text-zinc-600">~15 seconds</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && error !== "__DIAGNOSE__" && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-300">Error</div>
            <div className="text-sm text-red-400/80 mt-0.5">{error}</div>
          </div>
        </div>
      )}

      {/* Diagnose state */}
      {error === "__DIAGNOSE__" && <DiagnosePanel />}

      {/* Loading skeleton */}
      {loading && (
        <Card>
          <CardContent className="pt-5 space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <Brain className="w-4 h-4 text-indigo-400 animate-pulse" />
              </div>
              <div className="text-sm text-zinc-400">AI is analyzing your trading data...</div>
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`h-4 bg-zinc-800 rounded animate-pulse`} style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Insights result */}
      {insights && !loading && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <CardTitle className="text-base font-semibold text-white break-words">
                  AI Analysis — {PERIOD_LABELS[period]}
                </CardTitle>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                Just now
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={insights} />
          </CardContent>
        </Card>
      )}

      {/* Placeholder when nothing generated yet */}
      {!insights && !loading && !error && (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Brain className="w-7 h-7 text-zinc-700" />
            </div>
            <h3 className="text-base font-semibold text-zinc-400 mb-2">Ready to Analyze</h3>
            <p className="text-sm text-zinc-600 max-w-sm mx-auto">
              Select a time period and click &ldquo;Generate AI Insights&rdquo; to get AI-powered analysis of your trading patterns, psychology, and recommendations.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
