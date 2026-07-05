"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CryptoCheckoutButton } from "@/components/pricing/CryptoCheckoutButton";
import { pricingPlans } from "@/lib/pricing";

export function PricingPlansClient() {
  const [authLoading, setAuthLoading] = useState(true);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentEmail(data?.user?.email ?? null);
      } finally {
        setAuthLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-4">
      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardContent className="pt-5 space-y-2">
          {authLoading ? (
            <p className="text-sm text-zinc-400">Checking account session...</p>
          ) : currentEmail ? (
            <p className="text-sm text-zinc-300">
              Checkout will be linked to: <span className="text-white font-medium">{currentEmail}</span>
            </p>
          ) : (
            <p className="text-sm text-zinc-300">
              Sign in before checkout to link subscription with your account.{" "}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300">
                Go to Login
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pricingPlans.map((plan) => (
          <Card
            key={plan.id}
            className={
              plan.highlight
                ? "border-indigo-500/50 bg-indigo-500/5"
                : "border-zinc-800 bg-zinc-900/40"
            }
          >
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
                {plan.highlight && <Badge>{plan.highlight}</Badge>}
              </div>
              <p className="text-sm text-zinc-400">{plan.description}</p>
              <div>
                <div className="text-3xl font-bold text-white">${plan.monthlyUsd}</div>
                <div className="text-xs text-zinc-500">per month</div>
              </div>
              <div className="text-xs text-emerald-400">
                ${plan.yearlyUsd}/year (save ${plan.monthlyUsd * 12 - plan.yearlyUsd})
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="text-sm text-zinc-300 flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="space-y-3">
                <CryptoCheckoutButton
                  planId={plan.id}
                  billingCycle="monthly"
                  label={`${plan.cta} (Crypto Monthly)`}
                  disabled={!currentEmail}
                />
                <CryptoCheckoutButton
                  planId={plan.id}
                  billingCycle="yearly"
                  label={`${plan.cta} (Crypto Yearly)`}
                  disabled={!currentEmail}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
