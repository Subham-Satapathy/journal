import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if (auth.error || !auth.user) return auth.error!;

    const customer = await prisma.billingCustomer.findUnique({
      where: { email: auth.user.email.toLowerCase() },
      include: {
        subscriptions: {
          orderBy: { updatedAt: "desc" },
          take: 10,
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 30,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({
        customer: { email: auth.user.email },
        activeSubscription: null,
        latestSubscription: null,
        invoices: [],
      });
    }

    const now = new Date();
    const activeSubscription =
      customer.subscriptions.find(
        (s) => s.status === "active" && s.currentPeriodEnd && s.currentPeriodEnd > now
      ) ?? null;
    const latestSubscription = customer.subscriptions[0] ?? null;

    return NextResponse.json({
      customer: { email: customer.email, createdAt: customer.createdAt },
      activeSubscription,
      latestSubscription,
      invoices: customer.invoices,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load billing overview." },
      { status: 500 }
    );
  }
}
