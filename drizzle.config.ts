import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// Ensure Drizzle Kit reads env vars from .env.local used by Next.js
config({ path: ".env.local" })

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
})