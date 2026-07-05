import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isNowPaymentsSignatureValid, isSuccessfulPaymentStatus } from "@/lib/nowpayments";
import { sendPaymentReceiptEmail } from "@/lib/email";
import { findPlan } from "@/lib/pricing";

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;
    const signature = req.headers.get("x-nowpayments-sig");
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET?.trim();
    if (!ipnSecret) {
      return NextResponse.json(
        { received: false, error: "NOWPAYMENTS_IPN_SECRET is not configured." },
        { status: 503 }
      );
    }
    if (!isNowPaymentsSignatureValid(payload, signature, ipnSecret)) {
      return NextResponse.json({ received: false, error: "Invalid signature." }, { status: 401 });
    }

    const orderId = String(payload.order_id ?? "");
    const providerInvoiceId = payload.invoice_id ? String(payload.invoice_id) : null;
    const providerPaymentId = payload.payment_id ? String(payload.payment_id) : null;
    if (!orderId && !providerInvoiceId) {
      return NextResponse.json(
        { received: false, error: "Missing order_id and invoice_id." },
        { status: 400 }
      );
    }

    const paymentStatus = String(payload.payment_status ?? "unknown").toLowerCase();
    const invoice = await prisma.cryptoInvoice.findFirst({
      where: {
        OR: [
          ...(orderId ? [{ orderId }] : []),
          ...(providerInvoiceId ? [{ providerInvoiceId }] : []),
        ],
      },
      include: { customer: true },
    });
    if (!invoice) {
      return NextResponse.json({ received: false, error: "Invoice not found." }, { status: 404 });
    }

    const wasSuccessfulBefore = isSuccessfulPaymentStatus(invoice.status);
    const payloadCurrency = String(payload.price_currency ?? "").toLowerCase();
    const payloadAmount = Number(payload.price_amount ?? NaN);
    const amountMismatch =
      Number.isFinite(payloadAmount) &&
      Math.abs(payloadAmount - invoice.amountUsd) > 0.01;
    const currencyMismatch = payloadCurrency && payloadCurrency !== "usd";
    const mismatch = amountMismatch || currencyMismatch;
    const normalizedStatus = mismatch ? "mismatch" : paymentStatus;

    await prisma.cryptoInvoice.update({
      where: { id: invoice.id },
      data: {
        status: normalizedStatus,
        providerInvoiceId: providerInvoiceId ?? invoice.providerInvoiceId,
        paymentId: providerPaymentId ?? invoice.paymentId,
        payCurrency: payload.pay_currency ? String(payload.pay_currency) : invoice.payCurrency,
        paidAt:
          isSuccessfulPaymentStatus(paymentStatus) && !mismatch && !invoice.paidAt
            ? new Date()
            : invoice.paidAt,
        rawPayload: payload as unknown as object,
      },
    });

    if (!wasSuccessfulBefore && isSuccessfulPaymentStatus(paymentStatus) && !mismatch) {
      const existingActive = await prisma.subscription.findFirst({
        where: {
          customerId: invoice.customerId,
          status: "active",
        },
        orderBy: {
          currentPeriodEnd: "desc",
        },
      });
      const now = new Date();
      const anchor =
        existingActive?.currentPeriodEnd && existingActive.currentPeriodEnd > now
          ? existingActive.currentPeriodEnd
          : now;
      const periodEnd =
        invoice.billingCycle === "yearly" ? addMonths(anchor, 12) : addMonths(anchor, 1);

      if (!existingActive) {
        await prisma.subscription.create({
          data: {
            customerId: invoice.customerId,
            planId: invoice.planId,
            billingCycle: invoice.billingCycle,
            status: "active",
            activatedAt: now,
            currentPeriodStart: now,
            currentPeriodEnd: periodEnd,
          },
        });
      } else {
        await prisma.subscription.update({
          where: { id: existingActive.id },
          data: {
            planId: invoice.planId,
            billingCycle: invoice.billingCycle,
            status: "active",
            currentPeriodEnd: periodEnd,
            activatedAt: existingActive.activatedAt ?? now,
          },
        });
      }

      const planName = findPlan(invoice.planId)?.name ?? invoice.planId;
      const paidAt = invoice.paidAt ?? new Date();
      try {
        await sendPaymentReceiptEmail({
          to: invoice.customer.email,
          planName,
          billingCycle: invoice.billingCycle,
          amountUsd: invoice.amountUsd,
          paidAt,
          membershipEndsAt: periodEnd,
          transactionRef: providerPaymentId ?? providerInvoiceId,
        });
      } catch (emailError) {
        console.error("Payment receipt email failed", {
          customerEmail: invoice.customer.email,
          invoiceId: invoice.id,
          orderId: invoice.orderId,
          error: emailError instanceof Error ? emailError.message : "Unknown email error",
        });
      }
    }

    return NextResponse.json({ received: true, paymentStatus: normalizedStatus });
  } catch (error) {
    return NextResponse.json(
      {
        received: false,
        error: error instanceof Error ? error.message : "Webhook processing failed.",
      },
      { status: 400 }
    );
  }
}
