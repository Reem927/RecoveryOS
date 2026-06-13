import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

function makeRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN must be set for rate limiting.",
    )
  }
  return new Redis({ url, token })
}

// Lazy singleton — only connects when first limiter is used at request time.
let _redis: Redis | null = null
function redis() {
  if (!_redis) _redis = makeRedis()
  return _redis
}

// Chat + Sona: conversational, allow reasonable throughput
export const chatLimiter = new Ratelimit({
  redis: redis(),
  limiter: Ratelimit.slidingWindow(30, "1 m"),
  prefix: "rl:chat",
})

// Assessment summarize: one per assessment but allow retries
export const summarizeLimiter = new Ratelimit({
  redis: redis(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:summarize",
})

// Follow-up emails: expensive (Claude + Resend), keep tight
export const followupLimiter = new Ratelimit({
  redis: redis(),
  limiter: Ratelimit.slidingWindow(5, "1 m"),
  prefix: "rl:followup",
})

// Telegram: outbound messages triggered by practitioners
export const telegramLimiter = new Ratelimit({
  redis: redis(),
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  prefix: "rl:telegram",
})

export function rateLimitResponse(reset: number) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please slow down." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)),
      },
    },
  )
}
