import { Queue, Worker, QueueEvents, JobsOptions, type Processor } from "bullmq"
import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL
if (!REDIS_URL) {
  // Non-fatal: queues will throw on use, but keep app booting
  console.warn("[queue] Missing REDIS_URL/UPSTASH_REDIS_URL env; BullMQ disabled")
}

const connection = REDIS_URL ? new IORedis(REDIS_URL) : undefined
const QUEUE_PREFIX = "promo3"

export function createQueue(name: string, defaultJobOptions?: JobsOptions) {
  if (!connection) throw new Error("BullMQ connection not configured")
  return new Queue(`${QUEUE_PREFIX}:${name}`, { connection, defaultJobOptions })
}

export function createWorker<T = unknown>(
  name: string,
  processor: Processor<T, unknown>,
  opts?: { concurrency?: number }
) {
  if (!connection) throw new Error("BullMQ connection not configured")
  const worker = new Worker<T>(`${QUEUE_PREFIX}:${name}`, processor, {
    connection,
    concurrency: opts?.concurrency ?? 10,
  })
  const events = new QueueEvents(`${QUEUE_PREFIX}:${name}`, { connection })
  return { worker, events }
}

export const queues = {
  generate: () => createQueue("generate", { removeOnComplete: true, attempts: 3 }),
  download: () => createQueue("download", { removeOnComplete: true }),
  import: () => createQueue("import", { removeOnComplete: true, attempts: 3 }),
  verify: () => createQueue("verify", { removeOnComplete: true }),
}

// Convenient singleton exports for commonly used queues
export const generateQueue = queues.generate()