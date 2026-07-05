import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, ShieldCheck, TrendingUp, Brain, BarChart3, Upload, Quote } from "lucide-react";
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

      <header className="relative px-6 sm:px-10 py-5 border-b border-zinc-800/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Pnlogix" className="w-8 h-8 rounded" />
          <div>
            <div className="text-sm font-bold text-white">Pnlogix</div>
            <div className="text-[10px] text-zinc-500">Trading Journal</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <Link href="/pricing" className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500">Pricing</Link>
          <Link href="/login" className="px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500">Login</Link>
          <Link href="/signup" className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500">Get Started</Link>
        </div>
      </header>

      <section className="relative px-6 py-14 sm:px-10 sm:py-16">
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

      <section className="relative px-6 sm:px-10 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 fade-up">
            <div className="flex items-center gap-2 mb-3 text-indigo-300">
              <Upload className="w-4 h-4" />
              <span className="text-sm font-semibold">Import in Seconds</span>
            </div>
            <p className="text-sm text-zinc-400">
              Upload CSV/XLS files, use screenshot extraction, or add manual trades. Pnlogix adapts to your broker exports and helps map fields quickly.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> CSV / Excel smart mapping</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> Screenshot extraction with AI</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> Duplicate-aware import flow</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 fade-up-delayed">
            <div className="flex items-center gap-2 mb-3 text-cyan-300">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm font-semibold">Deep Analytics</span>
            </div>
            <p className="text-sm text-zinc-400">
              Go beyond win-rate. Track P&L curves, drawdown, time-based behavior, and pattern-specific outcomes to improve decision quality.
            </p>
            <ul className="mt-4 space-y-2 text-xs text-zinc-300">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> Calendar and hour/day heatmaps</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> Equity and drawdown tracking</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5" /> Symbol and side distribution</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="relative px-6 sm:px-10 pb-10">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
          <div className="flex items-center gap-2 mb-4 text-violet-300">
            <Brain className="w-4 h-4" />
            <h2 className="text-base font-semibold text-white">How Pnlogix Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: "1. Import", d: "Bring trades from file or screenshot in minutes." },
              { t: "2. Analyze", d: "Review patterns with visuals and behavior metrics." },
              { t: "3. Improve", d: "Use AI insights and routine reviews to build consistency." },
            ].map((item) => (
              <div key={item.t} className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <h3 className="text-sm font-semibold text-zinc-100">{item.t}</h3>
                <p className="text-xs text-zinc-400 mt-1">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 sm:px-10 pb-10">
        <h2 className="text-base font-semibold text-white mb-3">What traders say</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <Quote className="w-4 h-4 text-indigo-300 mb-2" />
            <p className="text-sm text-zinc-300">“I finally know which sessions are hurting my performance. The heatmaps changed how I review.”</p>
            <p className="text-xs text-zinc-500 mt-2">— Intraday options trader</p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
            <Quote className="w-4 h-4 text-indigo-300 mb-2" />
            <p className="text-sm text-zinc-300">“Screenshot import plus AI summaries makes journaling actually sustainable.”</p>
            <p className="text-xs text-zinc-500 mt-2">— Multi-asset retail trader</p>
          </div>
        </div>
      </section>

      <section className="relative px-6 sm:px-10 pb-12">
        <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 text-center space-y-3">
          <h2 className="text-xl font-bold text-white">Ready to trade with structure?</h2>
          <p className="text-sm text-indigo-100/80 max-w-xl mx-auto">
            Start with a plan that fits your trading frequency. Upgrade anytime as your workflow grows.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/signup" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500">
              Create Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="inline-flex items-center gap-2 rounded-lg border border-indigo-300/40 px-5 py-2.5 text-sm font-semibold text-indigo-100 hover:bg-white/10">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-zinc-800/50 px-6 sm:px-10 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
        <div>© {new Date().getFullYear()} Pnlogix. All rights reserved.</div>
        <div className="flex items-center gap-3">
          <Link href="/pricing" className="hover:text-zinc-300">Pricing</Link>
          <Link href="/login" className="hover:text-zinc-300">Login</Link>
          <Link href="/signup" className="hover:text-zinc-300">Sign up</Link>
        </div>
      </footer>
    </div>
  );
}
