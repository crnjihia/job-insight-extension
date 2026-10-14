import Redis from "ioredis";
import crypto from "crypto";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(redisUrl, {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy: () => null,
  enableOfflineQueue: false
});

// Avoid unhandled error events when Redis server is offline
redis.on("error", () => {
  // Graceful fallback for environments without active Redis
});

export function makeAnalysisCacheKey(jobDescription: string, cvText: string): string {
  const hash = crypto.createHash("sha256");
  hash.update((jobDescription || "") + "|" + (cvText || ""));
  return `analysis:${hash.digest("hex")}`;
}

export async function setAnalysisCache(key: string, data: any): Promise<void> {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      await redis.set(key, JSON.stringify(data), "EX", 60 * 60 * 24); // 24h cache
    }
  } catch {
    // Ignore cache write errors
  }
}

export async function getAnalysisCache(key: string): Promise<any | null> {
  try {
    if (redis.status === "ready" || redis.status === "connecting") {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    }
  } catch {
    // Ignore cache read errors
  }
  return null;
}
