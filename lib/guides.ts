export type GuideSection = {
  heading: string;
  body: string;
};

export type GuideArticle = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  keywords: string[];
  publishedAt: string;
  readTimeMinutes: number;
  sections: GuideSection[];
};

export const guides: GuideArticle[] = [
  {
    slug: "pocket-option-trading-journal-checklist",
    title: "Pocket Option Trading Journal Checklist for Daily Reviews",
    description:
      "Use this practical Pocket Option trading journal checklist to review entries, expiry choices, and execution discipline after each session.",
    excerpt:
      "A step-by-step daily checklist for binary options traders who want structured reviews and fewer repeated mistakes.",
    keywords: [
      "pocket option trading journal checklist",
      "binary options journal checklist",
      "pocket option review process",
    ],
    publishedAt: "2026-07-06",
    readTimeMinutes: 6,
    sections: [
      {
        heading: "Capture every trade quickly",
        body:
          "Record symbol, direction, stake size, expiry, outcome, and reason for entry. Fast capture keeps your dataset complete and makes pattern analysis reliable.",
      },
      {
        heading: "Tag avoidable errors",
        body:
          "Tag each loss as either process error or valid setup loss. This separates strategy variance from discipline mistakes like revenge entries or random expiry selection.",
      },
      {
        heading: "Run a 10-minute end-of-day review",
        body:
          "Check your best and worst hour, identify one repeated mistake, and define one execution rule for the next session. Keep the review short, objective, and repeatable.",
      },
    ],
  },
  {
    slug: "how-to-analyze-binary-options-losing-streaks",
    title: "How to Analyze Binary Options Losing Streaks Without Overreacting",
    description:
      "Learn how to break down binary options losing streaks using journal data so you can fix process errors without destroying a working strategy.",
    excerpt:
      "A framework to diagnose losing streaks using time blocks, setup quality, and behavior markers from your trading journal.",
    keywords: [
      "binary options losing streak analysis",
      "pocket option losing streak",
      "trading journal psychology",
    ],
    publishedAt: "2026-07-06",
    readTimeMinutes: 7,
    sections: [
      {
        heading: "Separate market conditions from execution drift",
        body:
          "Compare streak trades against your baseline win rate by session and setup type. If your process quality dropped, fix execution first before changing your playbook.",
      },
      {
        heading: "Measure emotional triggers",
        body:
          "Track behavior changes after two losses in a row: higher stake, faster entries, or ignoring filters. These are often the real reason streaks become account damage.",
      },
      {
        heading: "Use recovery rules",
        body:
          "Define pre-committed recovery rules: smaller size, max number of entries, and mandatory review break. Journal-based guardrails stop emotional escalation.",
      },
    ],
  },
  {
    slug: "best-pocket-option-journal-metrics-to-track",
    title: "Best Pocket Option Journal Metrics to Track for Consistent Growth",
    description:
      "Track the highest-impact Pocket Option journal metrics to improve consistency, reduce emotional trading, and optimize session performance.",
    excerpt:
      "The most useful performance and psychology metrics for binary options traders who want measurable progress.",
    keywords: [
      "best pocket option journal metrics",
      "binary options performance metrics",
      "trading consistency score",
    ],
    publishedAt: "2026-07-06",
    readTimeMinutes: 6,
    sections: [
      {
        heading: "Session win rate and payoff-adjusted expectancy",
        body:
          "Track win rate by session and pair it with payout context. Raw win rate alone can mislead if payout quality changes across trading windows.",
      },
      {
        heading: "Discipline metrics",
        body:
          "Measure rule violations, revenge entries, and overtrading days. These behavior metrics usually explain plateaus more than setup theory.",
      },
      {
        heading: "Consistency metrics",
        body:
          "Use weekly consistency score, drawdown depth, and recovery speed. Improving stability over time is a stronger signal than occasional large winning days.",
      },
    ],
  },
];

export function getGuideBySlug(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
