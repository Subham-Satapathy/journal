import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { PricingPlansClient } from "@/components/pricing/PricingPlansClient";
import { createPublicPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPublicPageMetadata({
  title: "Pricing",
  description:
    "Choose a Pnlogix plan and subscribe with crypto payments to unlock analytics, AI insights, and premium trading journal features.",
  path: "/pricing",
  keywords: [
    "trading journal pricing",
    "pocket option journal pricing",
    "crypto subscription trading app",
  ],
});

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const paymentStatus = params.status;

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Simple Pricing</h1>
        <p className="text-sm text-zinc-500 max-w-2xl">
          Choose a plan that fits your trading pace. Pay securely in crypto and start tracking your
          edge with Pnlogix.
        </p>
      </div>

      {paymentStatus === "cancelled" && (
        <Card className="border-amber-500/30 bg-amber-500/10">
          <CardContent className="pt-4">
            <p className="text-sm text-amber-200">
              Payment was cancelled before completion. No membership changes were made.
              You can retry checkout or resume from Billing if an invoice is still pending.
            </p>
          </CardContent>
        </Card>
      )}

      {paymentStatus === "success" && (
        <Card className="border-emerald-500/30 bg-emerald-500/10">
          <CardContent className="pt-4">
            <p className="text-sm text-emerald-200">
              Payment redirect completed. Membership activates after NOWPayments webhook confirmation.
              Open Billing to verify latest status.
            </p>
          </CardContent>
        </Card>
      )}

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
