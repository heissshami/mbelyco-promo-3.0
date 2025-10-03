import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db"
import { user, session, account } from "@/db/schema"

export const auth = betterAuth({
  // Drizzle adapter with explicit schema mapping for Better Auth
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  security: {
    // Enforce same-site and secure cookies in production
    cookies: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  },
  model: {
    user: {
      fields: {
        role: "role",
      },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
  ],
})