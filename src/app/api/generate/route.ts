import { NextResponse } from "next/server"
import { getGenerateQueue, isQueueEnabled } from "@/lib/queue"
import { ensureGenerateWorker } from "@/lib/workers/generate"

export async function POST(req: Request) {
  try {
    if (!isQueueEnabled()) {
      return NextResponse.json({ error: "Queue unavailable: configure REDIS_URL or UPSTASH_REDIS_URL" }, { status: 503 })
    }
    ensureGenerateWorker()
    const body = await req.json()
    const { name, prefix, length, count, expiresAt, metadata } = body || {}
    if (!count || count <= 0) {
      return NextResponse.json({ error: "count must be positive" }, { status: 400 })
    }
    const queue = getGenerateQueue()
    if (!queue) {
      return NextResponse.json({ error: "Queue unavailable" }, { status: 503 })
    }
    const job = await queue.add("generate", { name, prefix, length, count, expiresAt, metadata })
    return NextResponse.json({ jobId: job.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/generate] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}