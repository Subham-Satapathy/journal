export type PlanId = "starter" | "pro" | "elite";

export interface PricingPlan {
  id: PlanId;
  name: string;
  monthlyUsd: number;
  yearlyUsd: number;
  description: string;
  features: string[];
  highlight?: string;
  cta: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyUsd: 9,
    yearlyUsd: 79,
    description: "Perfect for getting disciplined with your trade reviews.",
    features: [
      "Up to 500 trades per month",
      "CSV/Excel and screenshot imports",
      "Dashboard and core analytics",
      "Email support",
    ],
    cta: "Start Starter",
  },
  {
    id: "pro",
    name: "Pro",
    monthlyUsd: 19,
    yearlyUsd: 179,
    description: "For active traders who want deeper AI insights and faster growth.",
    features: [
      "Unlimited trade imports",
      "Advanced analytics and heatmaps",
      "AI insights and psychology scoring",
      "Priority support",
    ],
    highlight: "Most Popular",
    cta: "Get Pro",
  },
  {
    id: "elite",
    name: "Elite",
    monthlyUsd: 39,
    yearlyUsd: 349,
    description: "For power users and teams who need premium limits and support.",
    features: [
      "Everything in Pro",
      "Unlimited AI insight generations",
      "Beta features early access",
      "VIP support",
    ],
    cta: "Go Elite",
  },
];

export function findPlan(planId: string) {
  return pricingPlans.find((plan) => plan.id === planId);
}
