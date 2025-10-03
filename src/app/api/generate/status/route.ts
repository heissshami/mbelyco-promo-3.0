import { NextResponse } from "next/server"
import { getGenerateQueue, isQueueEnabled } from "@/lib/queue"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const jobId = url.searchParams.get("jobId")
    if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 })
    if (!isQueueEnabled()) {
      return NextResponse.json({ error: "Queue unavailable" }, { status: 503 })
    }
    const queue = getGenerateQueue()
    if (!queue) {
      return NextResponse.json({ error: "Queue unavailable" }, { status: 503 })
    }
    const job = await queue.getJob(jobId)
    if (!job) return NextResponse.json({ error: "job not found" }, { status: 404 })
    const state = await job.getState()
    const progress = job.progress ?? null
    const returnValue = job.returnvalue ?? null
    return NextResponse.json({ state, progress, returnValue })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/generate/status] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}