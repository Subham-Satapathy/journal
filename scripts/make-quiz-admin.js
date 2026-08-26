#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function usage() {
  console.error("Usage:\n  node scripts/make-quiz-admin.js <email>");
}

async function main() {
  const email = process.argv[2];
  if (!email) {
    usage();
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isAdmin: true },
    select: { id: true, email: true, isAdmin: true },
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error("make-quiz-admin failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
