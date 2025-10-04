import { NextResponse } from "next/server"
import { db } from "@/db"
import { promoCode } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const code = url.searchParams.get("code")?.trim()
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 })

  const rows = await db
    .select({
      id: promoCode.id,
      status: promoCode.status,
      redeemedAt: promoCode.redeemedAt,
      verifiedAt: promoCode.verifiedAt,
    })
    .from(promoCode)
    .where(eq(promoCode.code, code))
    .limit(1)

  const row = rows[0]
  if (!row) return NextResponse.json({ valid: false, reason: "not_found" })
  const valid = row.status === "active" && !row.redeemedAt && row.status !== "blocked" && row.status !== "expired" && row.status !== "reported"
  return NextResponse.json({ valid, status: row.status, redeemedAt: row.redeemedAt, verifiedAt: row.verifiedAt })
}

export async function POST(req: Request) {
  const body = await req.json()
  const code: string | undefined = body?.code?.trim()
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 })

  const rows = await db
    .select({ id: promoCode.id })
    .from(promoCode)
    .where(and(eq(promoCode.code, code), eq(promoCode.status, "active")))
    .limit(1)
  const row = rows[0]
  if (!row) return NextResponse.json({ ok: false, reason: "invalid" })
  await db.update(promoCode).set({ status: "redeemed", redeemedAt: new Date() }).where(eq(promoCode.id, row.id))
  return NextResponse.json({ ok: true })
}