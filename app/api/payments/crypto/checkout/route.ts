import { NextRequest, NextResponse } from "next/server";
import { findPlan } from "@/lib/pricing";
import { getSiteUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/api-auth";

type CheckoutPayload = {
  planId?: string;
  billingCycle?: "monthly" | "yearly";
  payCurrency?: string;
};

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const body = (await req.json()) as CheckoutPayload;
    const planId = body.planId?.toLowerCase() ?? "";
    const billingCycle = body.billingCycle === "yearly" ? "yearly" : "monthly";
    const email = auth.user.email.toLowerCase();
    const payCurrencyRaw = body.payCurrency?.trim().toLowerCase() ?? "";
    const payCurrency = /^[a-z0-9_]{2,15}$/.test(payCurrencyRaw) ? payCurrencyRaw : undefined;

    const plan = findPlan(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan selected." }, { status: 400 });
    }

    const siteUrl = getSiteUrl();
    const amount = billingCycle === "yearly" ? plan.yearlyUsd : plan.monthlyUsd;
    const title = `${plan.name} ${billingCycle} subscription`;
    const nowPaymentsApiKey = process.env.NOWPAYMENTS_API_KEY;
    const nowPaymentsApiBase = process.env.NOWPAYMENTS_API_BASE_URL ?? "https://api.nowpayments.io/v1";
    const feePaidByUser = process.env.NOWPAYMENTS_FEE_PAID_BY_USER === "true";

    if (!nowPaymentsApiKey) {
      return NextResponse.json(
        {
          error: "Crypto checkout is not configured yet. Add NOWPAYMENTS_API_KEY in environment variables.",
        },
        { status: 503 }
      );
    }

    const orderId = `pnlogix_${plan.id}_${billingCycle}_${Date.now()}`;
    const customer = await prisma.billingCustomer.upsert({
      where: { email },
      update: {},
      create: { email },
    });

    const invoice = await prisma.cryptoInvoice.create({
      data: {
        customerId: customer.id,
        provider: "nowpayments",
        orderId,
        planId: plan.id,
        billingCycle,
        amountUsd: amount,
        status: "initiated",
      },
    });

    const response = await fetch(`${nowPaymentsApiBase}/invoice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": nowPaymentsApiKey,
      },
      body: JSON.stringify({
        price_amount: Number(amount.toFixed(2)),
        price_currency: "usd",
        pay_currency: payCurrency,
        order_id: orderId,
        order_description: title,
        is_fixed_rate: true,
        is_fee_paid_by_user: feePaidByUser,
        ipn_callback_url: `${siteUrl}/api/payments/crypto/webhook`,
        success_url: `${siteUrl}/pricing?status=success`,
        cancel_url: `${siteUrl}/pricing?status=cancelled`,
      }),
    });

    if (!response.ok) {
      const payload = await response.text();
      await prisma.cryptoInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "provider_error",
          rawPayload: payload ? { providerError: payload } : undefined,
        },
      });
      return NextResponse.json(
        { error: `Checkout provider error: ${payload || "Unknown error"}` },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as {
      invoice_url?: string;
      id?: string | number;
    };
    const hostedUrl = payload?.invoice_url;
    if (!hostedUrl) {
      await prisma.cryptoInvoice.update({
        where: { id: invoice.id },
        data: {
          status: "invalid_provider_response",
          rawPayload: payload as unknown as object,
        },
      });
      return NextResponse.json({ error: "Failed to create crypto checkout link." }, { status: 502 });
    }

    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: {
        providerInvoiceId: payload.id ? String(payload.id) : null,
        checkoutUrl: hostedUrl,
        status: "checkout_created",
        rawPayload: payload as unknown as object,
      },
    });

    return NextResponse.json({
      checkoutUrl: hostedUrl,
      provider: "nowpayments",
      invoiceId: payload.id ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Checkout initialization failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
