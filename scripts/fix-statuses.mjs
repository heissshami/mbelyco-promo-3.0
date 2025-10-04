import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is missing")
  const sql = neon(url)

  console.log("Updating promo_code.status default to 'active' ...")
  await sql`ALTER TABLE "promo_code" ALTER COLUMN "status" SET DEFAULT 'active'`

  console.log("Converting old statuses to canonical labels ...")
  await sql`UPDATE "promo_code" SET "status" = 'active' WHERE lower("status") = 'new'`
  await sql`UPDATE "promo_code" SET "status" = 'used' WHERE lower("status") = 'issued'`
  await sql`UPDATE "promo_code" SET "status" = 'blocked' WHERE lower("status") = 'invalid'`
  await sql`UPDATE "promo_code" SET "status" = lower("status") WHERE "status" IS NOT NULL`

  console.log("Done. Statuses converted and default updated.")
}

run().catch((err) => {
  console.error("Fix statuses failed:", err)
  process.exit(1)
})