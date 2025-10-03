import { NextResponse } from "next/server"
import { db } from "@/db"
import { promoCode, batch, legacyPromoCode, legacyBatch } from "@/db/schema"
import { and, eq, ilike, inArray, sql } from "drizzle-orm"

type ApiCodeItem = {
  id: string
  code: string
  status: string
  batchId: string
  batchName: string | null
  amount: number | null
  currency: string | null
  createdAt: Date
  updatedAt: Date
}

function mapStatusFilter(value: string): string | null {
  const v = value?.toLowerCase()
  if (!v) return null
  // Legacy → internal mapping
  // active → new, used → issued, redeemed → redeemed, expired → (not modeled), blocked → invalid
  switch (v) {
    case "active":
      return "new"
    case "used":
      return "issued"
    case "redeemed":
      return "redeemed"
    case "expired":
      return "expired" // not modeled; will yield zero
    case "blocked":
      return "invalid"
    default:
      // Allow direct internal statuses too
      return v
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search")?.trim() ?? ""
    const status = url.searchParams.get("status")?.trim() ?? ""
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)))
    const offset = (page - 1) * limit

    const whereClauses: any[] = []
    if (search) {
      whereClauses.push(ilike(promoCode.code, `%${search}%`))
    }
    const mappedStatus = mapStatusFilter(status)
    if (mappedStatus && mappedStatus !== "expired") {
      whereClauses.push(eq(promoCode.status, mappedStatus))
    }
    const whereExpr = whereClauses.length > 0 ? and(...whereClauses) : undefined

    // Total count respecting search and status (modern)
    const totalRowsModern = await db.select({ value: sql<number>`count(*)` }).from(promoCode).where(whereExpr as any)
    let total = Number(totalRowsModern[0]?.value ?? 0)

    // Counts by legacy categories (respect search, ignore selected status)
    const baseWhereClauses: any[] = []
    if (search) baseWhereClauses.push(ilike(promoCode.code, `%${search}%`))
    const baseWhereExpr = baseWhereClauses.length > 0 ? and(...baseWhereClauses) : undefined

    // Modern counts
    let grouped = await db
      .select({ s: promoCode.status, value: sql<number>`count(*)` })
      .from(promoCode)
      .where(baseWhereExpr as any)
      .groupBy(promoCode.status)
    let byInternal: Record<string, number> = Object.fromEntries(grouped.map((g) => [g.s, Number((g as any).value ?? 0)]))
    let allRows = await db.select({ value: sql<number>`count(*)` }).from(promoCode).where(baseWhereExpr as any)
    let allCount = Number(allRows[0]?.value ?? 0)

    let itemsRaw = await db
      .select({
        id: promoCode.id,
        code: promoCode.code,
        status: promoCode.status,
        batchId: promoCode.batchId,
        createdAt: promoCode.createdAt,
        updatedAt: promoCode.updatedAt,
        batchName: batch.name,
        metadata: promoCode.metadata,
      })
      .from(promoCode)
      .leftJoin(batch, eq(batch.id, promoCode.batchId))
      .where(whereExpr as any)
      .orderBy(sql`"promo_code"."created_at" DESC`)
      .limit(limit)
      .offset(offset)

    // If modern table is empty, attempt legacy fallback
    if (total === 0 && allCount === 0) {
      // Introspect legacy promo_codes columns to build a safe query
      let legacyCols: string[] = []
      try {
        const colsRes: any = await (db as any).execute(
          sql`select column_name from information_schema.columns where table_schema='public' and table_name='promo_codes' order by ordinal_position`
        )
        legacyCols = Array.isArray(colsRes)
          ? colsRes.map((c: any) => c.column_name)
          : colsRes.rows?.map((r: any) => r.column_name) ?? []
      } catch {}

      const hasCode = legacyCols.includes("code")
      const hasStatus = legacyCols.includes("status")
      const hasBatchId = legacyCols.includes("batch_id")
      const hasCreatedAt = legacyCols.includes("created_at")
      const hasUpdatedAt = legacyCols.includes("updated_at")
      const hasMetadata = legacyCols.includes("metadata")

      const legacyWhereClauses: any[] = []
      if (search && hasCode) legacyWhereClauses.push(ilike(legacyPromoCode.code, `%${search}%`))
      // For legacy status strings, map to internal when returning but filter on raw legacy values too
      if (status && hasStatus) {
        const s = status.toLowerCase()
        if (s && s !== "all") legacyWhereClauses.push(eq(legacyPromoCode.status, s))
      }
      const legacyWhereExpr = legacyWhereClauses.length > 0 ? and(...legacyWhereClauses) : undefined

      const totalRowsLegacy = await db.select({ value: sql<number>`count(*)` }).from(legacyPromoCode).where(legacyWhereExpr as any)
      total = Number(totalRowsLegacy[0]?.value ?? 0)

      // Recompute legacy grouped counts
      if (hasStatus) {
        grouped = await db
          .select({ s: legacyPromoCode.status, value: sql<number>`count(*)` })
          .from(legacyPromoCode)
          .where((search && hasCode ? ilike(legacyPromoCode.code, `%${search}%`) : undefined) as any)
          .groupBy(legacyPromoCode.status)
        // Project legacy counts into internal categories
        const legacyMap: Record<string, string> = {
          active: "new",
          used: "issued",
          redeemed: "redeemed",
          expired: "expired",
          blocked: "invalid",
        }
        const byLegacy: Record<string, number> = Object.fromEntries(grouped.map((g) => [g.s, Number((g as any).value ?? 0)]))
        byInternal = {}
        for (const [k, v] of Object.entries(byLegacy)) {
          const mapped = legacyMap[k?.toLowerCase()] ?? k?.toLowerCase()
          byInternal[mapped] = (byInternal[mapped] ?? 0) + v
        }
      } else {
        // No status column; keep counts minimal
        byInternal = {}
      }
      const allRowsLegacy = await db
        .select({ value: sql<number>`count(*)` })
        .from(legacyPromoCode)
        .where((search && hasCode ? ilike(legacyPromoCode.code, `%${search}%`) : undefined) as any)
      allCount = Number(allRowsLegacy[0]?.value ?? 0)

      itemsRaw = await db
        .select({
          id: legacyPromoCode.id,
          code: hasCode ? legacyPromoCode.code : (sql<string>`''` as any),
          status: hasStatus ? legacyPromoCode.status : (sql<string>`'active'` as any),
          batchId: hasBatchId ? legacyPromoCode.batchId : (sql<string>`''` as any),
          createdAt: hasCreatedAt ? legacyPromoCode.createdAt : (sql<Date>`NULL::timestamp` as any),
          updatedAt: hasUpdatedAt ? legacyPromoCode.updatedAt : (sql<Date>`NULL::timestamp` as any),
          batchName: legacyBatch.name,
          metadata: hasMetadata ? legacyPromoCode.metadata : (sql<string>`NULL::text` as any),
        })
        .from(legacyPromoCode)
        .leftJoin(legacyBatch, hasBatchId ? eq(legacyBatch.id, legacyPromoCode.batchId) : undefined as any)
        .where(legacyWhereExpr as any)
        .orderBy(
          hasCreatedAt
            ? sql`"promo_codes"."created_at" DESC`
            : hasUpdatedAt
            ? sql`"promo_codes"."updated_at" DESC`
            : sql`"promo_codes"."code" DESC`
        )
        .limit(limit)
        .offset(offset)
    }

    const items: ApiCodeItem[] = itemsRaw.map((row: any) => {
      let amount: number | null = null
      let currency: string | null = null
      try {
        if (row.metadata) {
          const meta = JSON.parse(row.metadata)
          if (typeof meta.amountPerCode === "number") amount = meta.amountPerCode
          else if (meta.amountPerCode != null) amount = Number(meta.amountPerCode)
          if (meta.currency) currency = String(meta.currency)
        }
      } catch {}
      // normalize legacy status strings
      let normalizedStatus = String(row.status ?? "")
      const s = normalizedStatus.toLowerCase()
      if (s === "active") normalizedStatus = "new"
      else if (s === "used") normalizedStatus = "issued"
      else if (s === "blocked") normalizedStatus = "invalid"
      // keep redeemed/expired as-is (expired will show zero in counters)
      return {
        id: row.id,
        code: row.code,
        status: normalizedStatus,
        batchId: row.batchId,
        batchName: row.batchName ?? null,
        amount,
        currency,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }
    })

    return NextResponse.json({
      page,
      pageSize: limit,
      total,
      counts: {
        all: allCount,
        active: (byInternal["new"] ?? 0),
        used: (byInternal["issued"] ?? 0),
        redeemed: (byInternal["redeemed"] ?? 0),
        expired: 0,
        blocked: (byInternal["invalid"] ?? 0),
        // Also expose internals for future UI needs
        new: (byInternal["new"] ?? 0),
        issued: (byInternal["issued"] ?? 0),
        invalid: (byInternal["invalid"] ?? 0),
      },
      items,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/promo-codes] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}