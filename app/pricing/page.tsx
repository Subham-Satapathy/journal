import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PricingPlansClient } from "@/components/pricing/PricingPlansClient";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose a Pnlogix plan and subscribe with crypto payments to unlock analytics, AI insights, and premium trading journal features.",
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Simple Pricing</h1>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Choose a plan that fits your trading pace. Pay securely in crypto and start tracking your
          edge with Pnlogix.
        </p>
      </div>

      <PricingPlansClient />

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardContent className="pt-5">
          <p className="text-xs text-zinc-500 leading-relaxed">
            After successful payment confirmation, your subscription record is activated automatically.
            Route protection and authenticated feature access will be enabled in the auth milestone.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
