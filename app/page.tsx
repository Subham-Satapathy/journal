import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  BarChart3,
  Upload,
  Quote,
  Sparkles,
  Target,
  Lock,
  Star,
  Clock,
} from "lucide-react";
import type { Metadata } from "next";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Pnlogix — Trading Journal for Serious Traders",
  description:
    "Track trades, reveal patterns, and grow consistency with Pnlogix analytics and AI insights.",
  path: "/",
  keywords: [
    "pocket option trading journal",
    "binary options trading journal",
    "trade journal app",
    "trading performance analytics",
    "trading psychology journal",
  ],
});

const navLinks = [
  { href: "/pricing", label: "Pricing" },
  { href: "/guides", label: "Guides" },
];

const featureCards = [
  {
    icon: TrendingUp,
    tone: "text-emerald-400 bg-emerald-500/10",
    title: "Performance Clarity",
    body: "Daily, weekly, and monthly analytics to spot what actually works.",
  },
  {
    icon: Sparkles,
    tone: "text-indigo-400 bg-indigo-500/10",
    title: "AI Insights",
    body: "Behavioral and psychology-based summaries to reduce repeated mistakes.",
  },
  {
    icon: ShieldCheck,
    tone: "text-sky-400 bg-sky-500/10",
    title: "Secure Access",
    body: "Account-based access with subscription-gated analytics and protected data.",
  },
];

const howItWorks = [
  { icon: Upload, t: "Import", d: "Bring trades from file or screenshot in minutes." },
  { icon: BarChart3, t: "Analyze", d: "Review patterns with visuals and behavior metrics." },
  { icon: Target, t: "Improve", d: "Use AI insights and routine reviews to build consistency." },
];

const sparklinePoints =
  "0,58 14,52 28,55 42,40 56,44 70,28 84,32 98,18 112,24 126,10 140,14 154,4";

export default function LandingPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Pnlogix?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Pnlogix is a trading journal platform that helps traders import trades, analyze performance, and improve discipline with analytics and AI insights.",
        },
      },
      {
        "@type": "Question",
        name: "Can I import Pocket Option trade history?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can import compatible CSV or Excel exports, and also use screenshot extraction for supported trade statements.",
        },
      },
      {
        "@type": "Question",
        name: "Does Pnlogix support both USD and INR display?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Display currency is available based on region configuration, with automatic conversion support for mixed trade currencies.",
        },
      },
    ],
  };

  return (
    <div className="relative bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Ambient grid backdrop */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "linear-gradient(to bottom, black, transparent)",
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[560px] bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,0.10),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">
            <img src="/logo.png?v=20260706t1823" alt="Pnlogix" className="h-8 w-8 rounded-md" />
            <div className="leading-tight">
              <div className="text-sm font-bold text-white">Pnlogix</div>
              <div className="text-[10px] text-slate-500">Trading Journal</div>
            </div>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="hidden rounded-lg px-3 py-2 text-slate-400 transition-colors hover:text-white sm:inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="ml-1 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="fade-up space-y-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                <Sparkles className="h-3 w-3" /> Built for fast, disciplined trading reviews
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
                Turn raw trades into a
                <span className="bg-gradient-to-r from-emerald-400 to-sky-400 bg-clip-text text-transparent"> repeatable edge.</span>
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-slate-400">
                Import from CSV, screenshots, or manual entries, then uncover performance and
                psychology patterns with an AI-powered journal built for active traders.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_0_0_1px_rgba(16,185,129,0.25),0_8px_24px_-8px_rgba(16,185,129,0.45)] transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  Start Free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                  View Plans
                </Link>
              </div>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-slate-500">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> No credit card required</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> CSV, Excel &amp; screenshot import</li>
              </ul>
            </div>

            {/* Product preview mockup */}
            <div className="fade-up-delayed relative">
              <div className="absolute -inset-4 -z-10 rounded-[28px] bg-emerald-500/10 blur-2xl" aria-hidden />
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/40 backdrop-blur">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-wide text-slate-500">Sample account · Illustrative</div>
                    <div className="mt-1 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">+$4,286.50</span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                        <TrendingUp className="h-3 w-3" /> +18.4%
                      </span>
                    </div>
                  </div>
                  <BarChart3 className="h-5 w-5 text-slate-600" />
                </div>

                <div className="mt-4 h-24 w-full">
                  <svg viewBox="0 0 160 64" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
                    <defs>
                      <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={`0,64 ${sparklinePoints} 154,4 160,64`}
                      fill="url(#sparkFill)"
                      stroke="none"
                    />
                    <polyline
                      points={sparklinePoints}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { label: "Win Rate", value: "63.2%" },
                    { label: "Avg R:R", value: "1.8" },
                    { label: "Trades", value: "312" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">{s.label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-100">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature strip */}
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {featureCards.map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 transition-colors hover:border-slate-700"
              >
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${f.tone}`}>
                  <f.icon className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm font-semibold text-slate-100">{f.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Deep-dive feature pair */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="mb-3 flex items-center gap-2 text-indigo-300">
                <Upload className="h-4 w-4" />
                <span className="text-sm font-semibold">Import in Seconds</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Upload CSV/XLS files, use screenshot extraction, or add manual trades. Pnlogix
                adapts to your broker exports and helps map fields quickly.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> CSV / Excel smart mapping</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Screenshot extraction with AI</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Duplicate-aware import flow</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
              <div className="mb-3 flex items-center gap-2 text-sky-300">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-semibold">Deep Analytics</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                Go beyond win-rate. Track P&amp;L curves, drawdown, time-based behavior, and
                pattern-specific outcomes to improve decision quality.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Calendar and hour/day heatmaps</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Equity and drawdown tracking</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-emerald-400" /> Symbol and side distribution</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 sm:p-8">
            <div className="mb-6 flex items-center gap-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <h2 className="text-base font-semibold text-white">How Pnlogix Works</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {howItWorks.map((item, i) => (
                <div key={item.t} className="relative rounded-xl border border-slate-800 bg-slate-950/60 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15 text-[11px] font-bold text-emerald-400">
                      {i + 1}
                    </span>
                    <item.icon className="h-4 w-4 text-slate-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{item.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SEO / credibility copy */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-2.5 py-1 text-[11px] font-medium text-slate-400">
              <Lock className="h-3 w-3" /> Independent analytics platform
            </div>
            <h2 className="text-base font-semibold text-white sm:text-lg">
              Pocket Option Trading Journal, Built for Consistency
            </h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Pnlogix helps active traders track Pocket Option and similar trade exports with a
              structured trading journal workflow. Review your trades, identify repeated
              mistakes, and improve execution discipline with clear analytics.
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              Pnlogix is an independent analytics and journaling platform. It does not provide
              broker endorsements, investment advice, or guarantees of trading outcomes.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-4 flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <h2 className="text-base font-semibold text-white">What binary options traders say</h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <Quote className="mb-2 h-4 w-4 text-indigo-300" />
              <p className="text-sm leading-relaxed text-slate-300">
                &ldquo;My Pocket Option sessions are finally structured. I can clearly see which
                time blocks and expiry choices are hurting my win rate.&rdquo;
              </p>
              <p className="mt-3 text-xs text-slate-500">— Pocket Option binary trader</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5">
              <Quote className="mb-2 h-4 w-4 text-indigo-300" />
              <p className="text-sm leading-relaxed text-slate-300">
                &ldquo;Screenshot import from Pocket Option and AI summaries helped me stop
                revenge trades and stay disciplined after losing streaks.&rdquo;
              </p>
              <p className="mt-3 text-xs text-slate-500">— Binary options scalper</p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-emerald-500/15 via-slate-900/60 to-slate-900/60 p-8 text-center sm:p-10">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" aria-hidden />
            <h2 className="relative text-xl font-bold text-white sm:text-2xl">Ready to trade with structure?</h2>
            <p className="relative mx-auto mt-2 max-w-xl text-sm text-slate-300">
              Start with a plan that fits your trading frequency. Upgrade anytime as your
              workflow grows.
            </p>
            <div className="relative mt-5 flex flex-wrap justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Create Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950/40 px-5 py-2.5 text-sm font-semibold text-slate-200 transition-colors hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
              >
                See Pricing
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/60 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>© {new Date().getFullYear()} Pnlogix. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Pricing</Link>
            <Link href="/guides" className="transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Guides</Link>
            <Link href="/login" className="transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Login</Link>
            <Link href="/signup" className="transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
