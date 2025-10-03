import { NextResponse } from "next/server"
import { db } from "@/db"
import { batch, legacyBatch, promoCode } from "@/db/schema"
import { and, eq, ilike, inArray, sql } from "drizzle-orm"

type BatchItem = {
  id: string
  name: string
  status: string
  quantity: number | null
  prefix: string | null
  suffix: string | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const search = url.searchParams.get("search")?.trim() ?? ""
    const status = url.searchParams.get("status")?.trim() ?? ""
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10))
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)))
    const offset = (page - 1) * limit

    // Build item filters for both modern and legacy (search + optional status)
    const itemWhereModern: any[] = []
    const itemWhereLegacy: any[] = []
    if (search) {
      itemWhereModern.push(ilike(batch.name, `%${search}%`))
      itemWhereLegacy.push(ilike(legacyBatch.name, `%${search}%`))
    }
    if (status) {
      itemWhereModern.push(eq(batch.status, status))
      itemWhereLegacy.push(eq(legacyBatch.status, status))
    }
    const whereModernExpr = itemWhereModern.length > 0 ? and(...itemWhereModern) : undefined
    const whereLegacyExpr = itemWhereLegacy.length > 0 ? and(...itemWhereLegacy) : undefined

    // Determine source table: prefer modern `batch`, fallback to legacy `batches` if it has rows
    // Probe both with minimal counts respecting search
    const modernCountRows = await db.select({ value: sql<number>`count(*)` }).from(batch).where(whereModernExpr as any)
    const legacyCountRows = await db.select({ value: sql<number>`count(*)` }).from(legacyBatch).where(whereLegacyExpr as any)
    const modernCount = Number(modernCountRows[0]?.value ?? 0)
    const legacyCount = Number(legacyCountRows[0]?.value ?? 0)
    const useLegacy = legacyCount > 0 && modernCount === 0
    const table = useLegacy ? legacyBatch : batch
    const totalRows = await db.select({ value: sql<number>`count(*)` }).from(table).where((useLegacy ? whereLegacyExpr : whereModernExpr) as any)
    const total = Number(totalRows[0]?.value ?? 0)

    // Aggregated counts by status (for filter badges)
    // Counts per status should ignore the status filter, but respect search
    const baseWhereClauses: any[] = []
    if (search) {
      baseWhereClauses.push(useLegacy ? ilike(legacyBatch.name, `%${search}%`) : ilike(batch.name, `%${search}%`))
    }
    const baseWhereExpr = baseWhereClauses.length > 0 ? and(...baseWhereClauses) : undefined
    const grouped = await db
      .select({ status: table.status, value: sql<number>`count(*)` })
      .from(table)
      .where(baseWhereExpr as any)
      .groupBy(table.status)
    const byStatus = Object.fromEntries(grouped.map((g) => [g.status, Number((g as any).value ?? 0)])) as Record<string, number>
    const allRows = await db
      .select({ value: sql<number>`count(*)` })
      .from(table)
      .where(baseWhereExpr as any)
    const allCount = Number(allRows[0]?.value ?? 0)

    // Page items
    const items = await db
      .select(
        useLegacy
          ? {
              id: legacyBatch.id,
              name: legacyBatch.name,
              status: legacyBatch.status,
              quantity: legacyBatch.totalCodes,
              prefix: sql<string>`''` as any,
              suffix: sql<string>`''` as any,
              createdBy: legacyBatch.assignedUser,
              createdAt: legacyBatch.createdAt,
              updatedAt: legacyBatch.updatedAt,
              amountPerCode: legacyBatch.amountPerCode,
              expirationDate: legacyBatch.expirationDate,
              redeemedCount: legacyBatch.redeemedCount,
            }
          : {
              id: batch.id,
              name: batch.name,
              status: batch.status,
              quantity: batch.quantity,
              prefix: batch.prefix,
              suffix: batch.suffix,
              createdBy: batch.createdBy,
              createdAt: batch.createdAt,
              updatedAt: batch.updatedAt,
            }
      )
      .from(table)
      .where((useLegacy ? whereLegacyExpr : whereModernExpr) as any)
      .orderBy(sql`"created_at" DESC`)
      .limit(limit)
      .offset(offset)

    let redeemedByBatch: Record<string, number> = {}
    if (!useLegacy) {
      const ids = items.map((b: any) => b.id)
      if (ids.length > 0) {
        const redeemedRows = await db
          .select({
            batchId: promoCode.batchId,
            count: sql<number>`count(*)`,
          })
          .from(promoCode)
          .where(and(inArray(promoCode.batchId, ids), eq(promoCode.status, "redeemed")))
          .groupBy(promoCode.batchId)
        redeemedByBatch = Object.fromEntries(redeemedRows.map((r) => [r.batchId, r.count]))
      }
    }

    const data = items.map((b: any) => {
      if (useLegacy) {
        const totalCodes = Math.max(0, Number(b.quantity ?? b.totalCodes ?? 0))
        const redeemed = Math.max(0, Number(b.redeemedCount ?? 0))
        const progress = totalCodes > 0 ? Math.min(100, Math.round((redeemed / totalCodes) * 100)) : 0
        return {
          id: b.id,
          name: b.name,
          status: b.status,
          quantity: totalCodes,
          prefix: "",
          suffix: "",
          createdBy: b.createdBy ?? "",
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          totalCodes,
          redeemed,
          progress,
          amountPerCode: b.amountPerCode ?? null,
          expirationDate: b.expirationDate ?? null,
        }
      } else {
        const totalCodes = Math.max(0, Number(b.quantity ?? 0))
        const redeemed = redeemedByBatch[b.id] ?? 0
        const progress = totalCodes > 0 ? Math.min(100, Math.round((redeemed / totalCodes) * 100)) : 0
        return {
          ...b,
          totalCodes,
          redeemed,
          progress,
        }
      }
    })

    return NextResponse.json({
      page,
      pageSize: limit,
      total,
      counts: {
        all: allCount,
        pending: byStatus["pending"] ?? 0,
        completed: byStatus["completed"] ?? 0,
        failed: byStatus["failed"] ?? 0,
        archived: byStatus["archived"] ?? 0,
        // Not modeled currently
        expired: 0,
        // Legacy mappings
        active: byStatus["completed"] ?? 0,
        blocked: byStatus["archived"] ?? 0,
      },
      items: data,
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/batches] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}