import { NextResponse } from "next/server"
import { db } from "@/db"
import { user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"

// DEV-ONLY: seeds a test user for local login
export async function POST() {
  try {
    const email = "test@example.com"
    const password = "password1234"

    const existing = await db.select().from(user).where(eq(user.email, email))
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, seeded: false, message: "User already exists", email })
    }

    // Create user via Better Auth to ensure proper hashing and relations
    await auth.api.signUpEmail({
      body: { email, password, name: "Test User" },
    })
    // Promote to admin for RBAC checks
    await db.update(user).set({ role: "admin" }).where(eq(user.email, email))

    return NextResponse.json({ ok: true, seeded: true, email, password })
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 })
  }
}

// Convenience: allow GET to seed in dev
export async function GET() {
  return POST()
}