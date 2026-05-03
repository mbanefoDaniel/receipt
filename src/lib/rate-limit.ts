import { db } from "./db";

type RateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
};

/**
 * Persistent, cross-instance rate limiter backed by the database.
 * Safe on serverless (Vercel) where in-memory state resets per cold start.
 */
export async function consumeRateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + input.windowMs);

  try {
    const result = await db.$transaction(async (tx) => {
      const existing = await tx.rateLimit.findUnique({ where: { key: input.key } });

      if (!existing || existing.resetAt < now) {
        await tx.rateLimit.upsert({
          where: { key: input.key },
          update: { count: 1, resetAt },
          create: { key: input.key, count: 1, resetAt }
        });
        return { count: 1, resetAt };
      }

      const updated = await tx.rateLimit.update({
        where: { key: input.key },
        data: { count: { increment: 1 } }
      });
      return { count: updated.count, resetAt: updated.resetAt };
    });

    const allowed = result.count <= input.limit;
    return {
      allowed,
      remaining: Math.max(input.limit - result.count, 0),
      retryAfterMs: allowed ? input.windowMs : Math.max(result.resetAt.getTime() - now.getTime(), 0)
    };
  } catch {
    // Fail open if DB is unavailable — do not block legitimate requests
    return { allowed: true, remaining: 0, retryAfterMs: 0 };
  }
}

export async function resetRateLimit(key: string) {
  try {
    await db.rateLimit.delete({ where: { key } });
  } catch {
    // Ignore if key doesn't exist
  }
}
