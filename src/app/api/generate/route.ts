import { NextResponse } from "next/server"
import { generateQueue } from "@/lib/queue"
import { ensureGenerateWorker } from "@/lib/workers/generate"

export async function POST(req: Request) {
  try {
    ensureGenerateWorker()
    const body = await req.json()
    const { name, prefix, length, count } = body || {}
    if (!count || count <= 0) {
      return NextResponse.json({ error: "count must be positive" }, { status: 400 })
    }
    const job = await generateQueue.add("generate", { name, prefix, length, count })
    return NextResponse.json({ jobId: job.id })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Internal error"
    console.error("[api/generate] error", e)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}