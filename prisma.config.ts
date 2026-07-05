import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use a dummy fallback so `prisma generate` doesn't throw during CI installs.
    // The real DATABASE_URL from env is used at runtime via schema.prisma.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost/placeholder",
  },
});
