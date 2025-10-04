import { config } from "dotenv"
config({ path: ".env.local" })

import { neon } from "@neondatabase/serverless"

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error("DATABASE_URL is missing")
  const sql = neon(url)

  const rows = await sql`SELECT lower("status") as status, COUNT(*) as count FROM "promo_code" GROUP BY lower("status") ORDER BY 1`
  console.log("Promo code status counts:")
  for (const row of rows) {
    console.log(`- ${row.status}: ${row.count}`)
  }
}

run().catch((err) => {
  console.error("Status counts failed:", err)
  process.exit(1)
})