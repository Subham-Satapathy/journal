"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CryptoCheckoutButton } from "@/components/pricing/CryptoCheckoutButton";
import { pricingPlans, type PlanId } from "@/lib/pricing";

type BillingData = {
  customer: { email: string; createdAt?: string };
  activeSubscription: {
    planId: string;
    billingCycle: string;
    status: string;
    currentPeriodEnd?: string | null;
    updatedAt?: string;
  } | null;
  latestSubscription: {
    planId: string;
    billingCycle: string;
    status: string;
    currentPeriodEnd?: string | null;
    updatedAt?: string;
  } | null;
  invoices: Array<{
    id: string;
    orderId: string;
    planId: string;
    billingCycle: string;
    amountUsd: number;
    status: string;
    checkoutUrl?: string | null;
    createdAt: string;
  }>;
};

export default function BillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/billing/overview", { cache: "no-store" });
        if (!res.ok) return;
        const payload = await res.json();
        setData(payload);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const currentPlan = useMemo(() => {
    const planId = data?.activeSubscription?.planId ?? data?.latestSubscription?.planId;
    return pricingPlans.find((p) => p.id === (planId as PlanId));
  }, [data]);

  if (loading) {
    return <div className="animate-pulse h-40 rounded-xl bg-zinc-900/50 border border-zinc-800" />;
  }

  const active = data?.activeSubscription;
  const latest = data?.latestSubscription;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Membership</h1>
        <p className="text-sm text-zinc-500 mt-1">
          View your plan, renewal status, and crypto payment history.
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-white text-base">Membership Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-zinc-300">
            Account: <span className="text-white font-medium">{data?.customer?.email}</span>
          </p>
          {active ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Active</Badge>
                <span className="text-zinc-300">
                  {active.planId.toUpperCase()} ({active.billingCycle})
                </span>
              </div>
              <p className="text-zinc-400">
                Valid until:{" "}
                <span className="text-zinc-200">
                  {active.currentPeriodEnd ? new Date(active.currentPeriodEnd).toLocaleString() : "N/A"}
                </span>
              </p>
            </>
          ) : (
            <div className="space-y-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Inactive</Badge>
              <p className="text-zinc-400">
                No active membership found. Renew to restore full analytics access.
              </p>
            </div>
          )}

          <div className="pt-2 flex flex-wrap gap-2">
            <Link
              href="/pricing"
              className="inline-flex items-center rounded-lg border border-zinc-700 px-3 py-1.5 text-xs text-zinc-200 hover:border-zinc-500"
            >
              Compare Plans
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-white text-base">Extend or Renew</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentPlan ? (
            <>
              <p className="text-sm text-zinc-400">
                Quick renew for your current plan: <span className="text-zinc-200">{currentPlan.name}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <CryptoCheckoutButton
                  planId={currentPlan.id}
                  billingCycle="monthly"
                  label={`Renew ${currentPlan.name} Monthly`}
                />
                <CryptoCheckoutButton
                  planId={currentPlan.id}
                  billingCycle="yearly"
                  label={`Extend ${currentPlan.name} Yearly`}
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-zinc-400">
              Choose a plan from <Link href="/pricing" className="text-indigo-400">pricing</Link> to activate membership.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-zinc-900/40">
        <CardHeader>
          <CardTitle className="text-white text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {!data?.invoices?.length ? (
            <p className="text-sm text-zinc-500">No payment attempts yet.</p>
          ) : (
            <>
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Plan</th>
                    <th className="text-left py-2">Cycle</th>
                    <th className="text-left py-2">Amount</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-left py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {data.invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-zinc-900">
                      <td className="py-2 text-zinc-400">{new Date(inv.createdAt).toLocaleString()}</td>
                      <td className="py-2 text-zinc-200">{inv.planId.toUpperCase()}</td>
                      <td className="py-2 text-zinc-400">{inv.billingCycle}</td>
                      <td className="py-2 text-zinc-300">${inv.amountUsd.toFixed(2)}</td>
                      <td className="py-2">
                        <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">{inv.status}</span>
                      </td>
                      <td className="py-2">
                        {inv.checkoutUrl && ["checkout_created", "initiated", "pending"].includes(inv.status) ? (
                          <a
                            href={inv.checkoutUrl}
                            className="text-indigo-400 hover:text-indigo-300"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Resume
                          </a>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden space-y-2">
              {data.invoices.map((inv) => (
                <div key={inv.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-zinc-200 text-xs font-semibold">
                      {inv.planId.toUpperCase()} ({inv.billingCycle})
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-[10px]">{inv.status}</span>
                  </div>
                  <div className="text-[11px] text-zinc-500">{new Date(inv.createdAt).toLocaleString()}</div>
                  <div className="text-sm text-zinc-300">${inv.amountUsd.toFixed(2)}</div>
                  {inv.checkoutUrl && ["checkout_created", "initiated", "pending"].includes(inv.status) ? (
                    <a
                      href={inv.checkoutUrl}
                      className="inline-flex text-xs text-indigo-400 hover:text-indigo-300"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Resume
                    </a>
                  ) : (
                    <span className="text-xs text-zinc-600">No action</span>
                  )}
                </div>
              ))}
            </div>
            </>
          )}
          {latest && !active && (
            <p className="mt-3 text-xs text-amber-300">
              Latest membership status is <strong>{latest.status}</strong>. Renew to reactivate access.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
