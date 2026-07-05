import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, TrendingUp } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pnlogix — Trading Journal for Serious Traders",
  description:
    "Track trades, reveal patterns, and grow consistency with Pnlogix analytics and AI insights.",
  alternates: {
    canonical: "/",
  },
};

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-b from-zinc-950 via-zinc-950 to-zinc-900">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-indigo-600/20 blur-3xl float-slow" />
        <div className="absolute top-24 -right-20 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl float-slower" />
      </div>

      <section className="relative px-6 py-14 sm:px-10 sm:py-20">
        <div className="max-w-4xl space-y-6 fade-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" />
            Built for fast, disciplined trading reviews
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Pnlogix helps you turn raw trades into a repeatable edge.
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl">
            Import from CSV, screenshots, or manual entries, then uncover performance and psychology
            patterns with an AI-powered journal designed for active traders.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              Start Free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/40 px-5 py-2.5 text-sm font-semibold text-zinc-200 transition hover:border-zinc-500"
            >
              View Plans
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Already have an account?
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-3 fade-up-delayed">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
            <h3 className="text-sm font-semibold text-zinc-100">Performance Clarity</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Daily, weekly, and monthly analytics to spot what actually works.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <Sparkles className="h-5 w-5 text-indigo-400 mb-2" />
            <h3 className="text-sm font-semibold text-zinc-100">AI Insights</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Behavioral and psychology-based summaries to reduce repeated mistakes.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <ShieldCheck className="h-5 w-5 text-cyan-400 mb-2" />
            <h3 className="text-sm font-semibold text-zinc-100">Secure Access</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Account-based access with subscription-gated analytics and protected data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
