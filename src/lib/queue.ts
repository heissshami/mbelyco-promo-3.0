import { Queue, Worker, QueueEvents, JobsOptions, type Processor } from "bullmq"
import IORedis from "ioredis"

const REDIS_URL = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL
if (!REDIS_URL) {
  console.warn("[queue] Missing REDIS_URL/UPSTASH_REDIS_URL env; BullMQ disabled")
}

// BullMQ requires maxRetriesPerRequest to be null for blocking commands
const connection = REDIS_URL ? new IORedis(REDIS_URL, { maxRetriesPerRequest: null }) : undefined
const QUEUE_PREFIX = "promo3"

export function isQueueEnabled() {
  return !!connection
}

export function createQueue(name: string, defaultJobOptions?: JobsOptions) {
  if (!connection) throw new Error("BullMQ connection not configured")
  // Use BullMQ prefix option instead of ':' in queue name to avoid errors
  return new Queue(name, { connection, defaultJobOptions, prefix: QUEUE_PREFIX })
}

export function createWorker<T = unknown>(
  name: string,
  processor: Processor<T, unknown>,
  opts?: { concurrency?: number }
): { worker: Worker<T>; events: QueueEvents } | null {
  if (!connection) return null
  const worker = new Worker<T>(name, processor, {
    connection,
    concurrency: opts?.concurrency ?? 10,
    prefix: QUEUE_PREFIX,
  })
  const events = new QueueEvents(name, { connection, prefix: QUEUE_PREFIX })
  return { worker, events }
}

// Lazy singletons to avoid early crashes when Redis is missing
let _generateQueue: Queue | null | undefined
export function getGenerateQueue() {
  if (!connection) return null
  if (!_generateQueue) {
    _generateQueue = new Queue("generate", {
      connection,
      defaultJobOptions: { removeOnComplete: true, attempts: 3 },
      prefix: QUEUE_PREFIX,
    })
  }
  return _generateQueue
}

export const queues = {
  generate: getGenerateQueue,
}