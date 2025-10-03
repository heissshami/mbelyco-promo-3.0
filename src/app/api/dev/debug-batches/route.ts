import { NextResponse } from "next/server"
import { db } from "@/db"
import { batch, legacyBatch } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function GET() {
  try {
    const result: any = {
      tables: [],
      batch: { count: null, sample: [], error: null },
      batches: { count: null, sample: [], error: null },
    }

    // List public tables
    try {
      // drizzle supports raw execute in recent versions
      const tables = await (db as any).execute(sql`select table_name from information_schema.tables where table_schema = 'public' order by table_name`)
      result.tables = Array.isArray(tables) ? tables.map((t: any) => t.table_name) : tables.rows?.map((r: any) => r.table_name) ?? []
    } catch (e) {
      result.tables = { error: (e as Error).message }
    }

    // Column introspection
    try {
      const colsBatch = await (db as any).execute(sql`select column_name from information_schema.columns where table_schema='public' and table_name='batch' order by ordinal_position`)
      result.batch.columns = Array.isArray(colsBatch) ? colsBatch.map((c: any) => c.column_name) : colsBatch.rows?.map((r: any) => r.column_name) ?? []
    } catch (e) {
      result.batch.columns = { error: (e as Error).message }
    }
    try {
      const colsLegacy = await (db as any).execute(sql`select column_name from information_schema.columns where table_schema='public' and table_name='batches' order by ordinal_position`)
      result.batches.columns = Array.isArray(colsLegacy) ? colsLegacy.map((c: any) => c.column_name) : colsLegacy.rows?.map((r: any) => r.column_name) ?? []
    } catch (e) {
      result.batches.columns = { error: (e as Error).message }
    }

    // Modern table: batch
    try {
      const c = await db.select({ value: sql<number>`count(*)` }).from(batch)
      result.batch.count = c[0]?.value ?? 0
      const sample = await db
        .select({ id: batch.id, name: batch.name, status: batch.status, quantity: batch.quantity })
        .from(batch)
        .orderBy(sql`"created_at" DESC`)
        .limit(5)
      result.batch.sample = sample
    } catch (e) {
      result.batch.error = (e as Error).message
    }

    // Legacy table: batches
    try {
      const c = await db.select({ value: sql<number>`count(*)` }).from(legacyBatch)
      result.batches.count = c[0]?.value ?? 0
      const sample = await db
        .select({ id: legacyBatch.id, name: legacyBatch.name, status: legacyBatch.status, quantity: legacyBatch.quantity })
        .from(legacyBatch)
        .orderBy(sql`"created_at" DESC`)
        .limit(5)
      result.batches.sample = sample
    } catch (e) {
      result.batches.error = (e as Error).message
    }

    return NextResponse.json(result)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}