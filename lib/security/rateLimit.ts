import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({ url: process.env.UPSTASH_REDIS_REST_URL!, token: process.env.UPSTASH_REDIS_REST_TOKEN! });
export const refineRatelimit = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "60 s"), ephemeralCache: new Map() });

export function getIp(req: Request) {
  const x = req.headers.get('x-forwarded-for');
  return x ? x.split(',')[0] : 'anonymous';
}
