#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function hasConfirmFlag() {
  return process.argv.includes("--confirm");
}

async function main() {
  if (!hasConfirmFlag()) {
    console.error(
      "Refusing to wipe DB without confirmation.\n" +
        "Run: npm run db:wipe:all -- --confirm"
    );
    process.exit(1);
  }

  const result = await prisma.$transaction(async (tx) => {
    const emailOtp = await tx.emailVerificationOtp.deleteMany({});
    const trade = await tx.trade.deleteMany({});
    const dailyPnl = await tx.dailyPnl.deleteMany({});
    const subscription = await tx.subscription.deleteMany({});
    const invoice = await tx.cryptoInvoice.deleteMany({});
    const billingCustomer = await tx.billingCustomer.deleteMany({});
    const user = await tx.user.deleteMany({});

    return {
      emailOtp: emailOtp.count,
      trade: trade.count,
      dailyPnl: dailyPnl.count,
      subscription: subscription.count,
      invoice: invoice.count,
      billingCustomer: billingCustomer.count,
      user: user.count,
    };
  });

  console.log("DB wipe complete:");
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((error) => {
    console.error("db:wipe:all failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
