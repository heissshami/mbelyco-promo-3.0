import { Redis } from "@upstash/redis"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Generic cache helper: caches JSON-serializable results under a namespaced key
export async function cacheJson<T>(key: string, fn: () => Promise<T>, ttlSec = 60) {
  const namespaced = `app:cache:${key}`
  const hit = await redis.get<T>(namespaced)
  if (hit) return hit
  const data = await fn()
  await redis.set(namespaced, data, { ex: ttlSec })
  return data
}