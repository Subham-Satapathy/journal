import { prisma } from "@/lib/prisma";

export async function getActiveSubscriptionByEmail(email: string) {
  const customer = await prisma.billingCustomer.findUnique({
    where: { email: email.toLowerCase() },
    include: {
      subscriptions: {
        where: {
          status: "active",
        },
        orderBy: {
          currentPeriodEnd: "desc",
        },
        take: 1,
      },
    },
  });
  const subscription = customer?.subscriptions[0] ?? null;
  if (!subscription) return null;
  if (!subscription.currentPeriodEnd) return null;
  if (subscription.currentPeriodEnd <= new Date()) return null;
  return subscription;
}
