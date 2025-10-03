import { db } from "@/db"
import { batch, promoCode } from "@/db/schema"
import { createWorker, isQueueEnabled } from "@/lib/queue"
import { generateCode, generateLegacyCode, normalizePrefix } from "@/lib/promo"
import { eq } from "drizzle-orm"
import crypto from "crypto"

type GenerateJob = {
  name: string
  prefix: string
  length: number
  count: number
  expiresAt?: string | null
  metadata?: string | null
  format?: "legacy" | "default"
}

declare global {
  var __promo_generate_worker__: boolean | undefined
}

export function ensureGenerateWorker() {
  if (!isQueueEnabled()) return
  if (globalThis.__promo_generate_worker__) return
  const { worker } = createWorker<GenerateJob>(
    "generate",
    async (job) => {
      const data = job.data
      const name = data.name?.trim() || `Batch ${new Date().toISOString()}`
      const prefix = normalizePrefix(data.prefix || "")
      const length = Math.max(4, Math.min(24, data.length || 8))
      const count = Math.max(1, Math.min(100_000, data.count || 100))
      const metadata = (data.metadata ?? null) || null
      const expiresAt = (data.expiresAt ?? null) || null
      const description = expiresAt ? `Expires at: ${expiresAt}` : undefined
      let createdBy = "system"
      try {
        if (metadata) {
          const metaObj = JSON.parse(metadata)
          if (metaObj?.assignToUser) createdBy = String(metaObj.assignToUser)
        }
      } catch {}
      // Create batch
      const batchId = crypto.randomUUID()
      await db
        .insert(batch)
        .values({
          id: batchId,
          name,
          description,
          prefix,
          codeLength: length,
          quantity: count,
          createdBy,
          status: "pending",
        })

      const chunkSize = 1000
      for (let i = 0; i < count; i += chunkSize) {
        const size = Math.min(chunkSize, count - i)
        const useLegacy = (data.format === "legacy") || (!prefix && length === 12)
        const values = Array.from({ length: size }).map(() => ({
          id: crypto.randomUUID(),
          batchId,
          code: useLegacy ? generateLegacyCode() : generateCode(prefix, length),
          status: "new",
          metadata,
        }))
        await db.insert(promoCode).values(values)
        await job.updateProgress(Math.round(((i + size) / count) * 100))
      }

      await db.update(batch).set({ status: "completed" }).where(eq(batch.id, batchId))
      return { batchId }
    },
    { concurrency: 2 }
  )
  worker?.on("error", (e) => console.error("[generate-worker] error", e))
  globalThis.__promo_generate_worker__ = true
}