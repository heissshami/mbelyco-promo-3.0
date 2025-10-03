import { NextResponse } from "next/server"
import { getGenerateQueue, isQueueEnabled } from "@/lib/queue"
import { ensureGenerateWorker } from "@/lib/workers/generate"
import { db } from "@/db"
import { batch } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: Request) {
  try {
    if (!isQueueEnabled()) {
      return NextResponse.json({ error: "Queue unavailable: configure REDIS_URL or UPSTASH_REDIS_URL" }, { status: 503 })
    }
    ensureGenerateWorker()
    const body = await req.json()
    let { name, prefix, length, count, expiresAt, metadata, format } = body || {}
    if (!count || count <= 0) {
      return NextResponse.json({ error: "count must be positive" }, { status: 400 })
    }
    // Normalize batch name per PRD: auto-capitalized with BATCH_ prefix
    if (typeof name === "string") {
      const trimmed = name.trim().toUpperCase()
      name = trimmed.startsWith("BATCH_") ? trimmed : `BATCH_${trimmed}`
    }
    // Enforce uniqueness of batch name
    if (name) {
      const existing = await db.select().from(batch).where(eq(batch.name, name)).limit(1)
      if (existing.length > 0) {
        return NextResponse.json({ error: "Batch name must be unique" }, { status: 409 })
      }
    }
    const queue = getGenerateQueue()
    if (!queue) {
      return NextResponse.json({ error: "Queue unavailable" }, { status: 503 })
    }
    const job = await queue.add("generate", { name, prefix, length, count, expiresAt, metadata, format })
    return NextResponse.json({ jobId: job.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/generate] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}