#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const TABLE_ACTIONS = {
  emailverificationotp: () => prisma.emailVerificationOtp.deleteMany({}),
  trade: () => prisma.trade.deleteMany({}),
  dailypnl: () => prisma.dailyPnl.deleteMany({}),
  subscription: () => prisma.subscription.deleteMany({}),
  cryptoinvoice: () => prisma.cryptoInvoice.deleteMany({}),
  billingcustomer: () => prisma.billingCustomer.deleteMany({}),
  user: () => prisma.user.deleteMany({}),
};

const ALIASES = {
  email_otp: "emailverificationotp",
  emailotp: "emailverificationotp",
  trades: "trade",
  daily_pnl: "dailypnl",
  dailypnl: "dailypnl",
  subscriptions: "subscription",
  invoices: "cryptoinvoice",
  crypto_invoice: "cryptoinvoice",
  customers: "billingcustomer",
  billing_customer: "billingcustomer",
  users: "user",
};

function getArgValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] || null;
}

function normalizeTableName(value) {
  if (!value) return null;
  const key = value.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  return ALIASES[key] || key;
}

function hasConfirmFlag() {
  return process.argv.includes("--confirm");
}

function usage() {
  const allowed = Object.keys(TABLE_ACTIONS).join(", ");
  console.error(
    "Usage:\n" +
      "  npm run db:wipe:table -- --table <name> --confirm\n\n" +
      `Allowed table names: ${allowed}`
  );
}

async function main() {
  const rawTable = getArgValue("--table");
  const table = normalizeTableName(rawTable);

  if (!table || !TABLE_ACTIONS[table]) {
    console.error(`Unknown or missing table: ${rawTable ?? "(none)"}`);
    usage();
    process.exit(1);
  }

  if (!hasConfirmFlag()) {
    console.error(
      `Refusing to wipe table '${table}' without confirmation.\n` +
        "Run: npm run db:wipe:table -- --table " +
        `${rawTable} --confirm`
    );
    process.exit(1);
  }

  const result = await TABLE_ACTIONS[table]();
  console.log(
    JSON.stringify(
      {
        table,
        deleted: result.count,
      },
      null,
      2
    )
  );
}

main()
  .catch((error) => {
    console.error("db:wipe:table failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
