import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  // Don't use env() here — it throws if DATABASE_URL is missing during CI/build.
  // The datasource url is already declared in schema.prisma via env("DATABASE_URL").
});
