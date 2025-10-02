import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Neon serverless client with SSL enforced via connection string
const sql = neon(process.env.DATABASE_URL!)

export const db = drizzle(sql)