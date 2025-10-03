import { Queue, Worker, QueueEvents, JobsOptions, type Processor } from "bullmq"
import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL
if (!REDIS_URL) {
  console.warn("[queue] Missing REDIS_URL/UPSTASH_REDIS_URL env; BullMQ disabled")
}

const connection = REDIS_URL ? new IORedis(REDIS_URL) : undefined
const QUEUE_PREFIX = "promo3"

export function isQueueEnabled() {
  return !!connection
}

export function createQueue(name: string, defaultJobOptions?: JobsOptions) {
  if (!connection) throw new Error("BullMQ connection not configured")
  return new Queue(`${QUEUE_PREFIX}:${name}`, { connection, defaultJobOptions })
}

export function createWorker<T = unknown>(
  name: string,
  processor: Processor<T, unknown>,
  opts?: { concurrency?: number }
): { worker: Worker<T>; events: QueueEvents } | null {
  if (!connection) return null
  const worker = new Worker<T>(`${QUEUE_PREFIX}:${name}`, processor, {
    connection,
    concurrency: opts?.concurrency ?? 10,
  })
  const events = new QueueEvents(`${QUEUE_PREFIX}:${name}`, { connection })
  return { worker, events }
}

// Lazy singletons to avoid early crashes when Redis is missing
let _generateQueue: Queue | null | undefined
export function getGenerateQueue() {
  if (!connection) return null
  if (!_generateQueue) {
    _generateQueue = new Queue(`${QUEUE_PREFIX}:generate`, {
      connection,
      defaultJobOptions: { removeOnComplete: true, attempts: 3 },
    })
  }
  return _generateQueue
}

export const queues = {
  generate: getGenerateQueue,
}