// Simple in-memory sliding-window rate limiter for API endpoints (e.g., login attempts)

interface RateLimitRecord {
  attempts: number
  firstAttemptAt: number
  blockedUntil: number | null
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Clean up expired records every 10 minutes to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.blockedUntil && record.blockedUntil < now) {
        rateLimitStore.delete(key)
      } else if (now - record.firstAttemptAt > 60 * 60 * 1000) {
        rateLimitStore.delete(key)
      }
    }
  }, 10 * 60 * 1000)
}

/**
 * Checks if a rate limit key (e.g. "login:ip:email") is currently blocked.
 * @param key Unique identifier for the rate limit target
 * @param maxAttempts Maximum allowed failed attempts before blocking (default: 5)
 * @param windowMs Time window in milliseconds (default: 15 minutes)
 * @returns { allowed: boolean, remainingMs?: number }
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { allowed: boolean; remainingMs?: number; remainingAttempts?: number } {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record) {
    return { allowed: true, remainingAttempts: maxAttempts }
  }

  // Check if currently blocked
  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      remainingMs: record.blockedUntil - now,
      remainingAttempts: 0,
    }
  }

  // Check if window has expired
  if (now - record.firstAttemptAt > windowMs) {
    rateLimitStore.delete(key)
    return { allowed: true, remainingAttempts: maxAttempts }
  }

  // Check if attempts exceeded
  if (record.attempts >= maxAttempts) {
    record.blockedUntil = now + windowMs
    return {
      allowed: false,
      remainingMs: windowMs,
      remainingAttempts: 0,
    }
  }

  return {
    allowed: true,
    remainingAttempts: maxAttempts - record.attempts,
  }
}

/**
 * Records a failed attempt for the specified key.
 */
export function recordFailedAttempt(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000
): { attempts: number; blocked: boolean; remainingMs?: number } {
  const now = Date.now()
  let record = rateLimitStore.get(key)

  if (!record || now - record.firstAttemptAt > windowMs) {
    record = { attempts: 1, firstAttemptAt: now, blockedUntil: null }
  } else {
    record.attempts += 1
  }

  if (record.attempts >= maxAttempts) {
    record.blockedUntil = now + windowMs
  }

  rateLimitStore.set(key, record)

  return {
    attempts: record.attempts,
    blocked: record.attempts >= maxAttempts,
    remainingMs: record.blockedUntil ? record.blockedUntil - now : undefined,
  }
}

/**
 * Resets rate limit counter upon successful action (e.g. successful login).
 */
export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key)
}
