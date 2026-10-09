type RateLimitEntry = {
  count: number;
  windowStart: number;
};

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 6000;

const requestStore = new Map<string, RateLimitEntry>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function checkCommentRateLimit(
  userId: string
): RateLimitResult {
  const now = Date.now();

  const existing = requestStore.get(userId);

  if (!existing) {
    requestStore.set(userId, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: 0,
    };
  }

  const elapsed = now - existing.windowStart;

  if (elapsed >= WINDOW_MS) {
    requestStore.set(userId, {
      count: 1,
      windowStart: now,
    });

    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      retryAfterSeconds: 0,
    };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil(
      (WINDOW_MS - elapsed) / 1000
    );

    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  existing.count += 1;

  return {
    allowed: true,
    remaining: MAX_REQUESTS - existing.count,
    retryAfterSeconds: 0,
  };
}

export function clearCommentRateLimit(
  userId: string
): void {
  requestStore.delete(userId);
}