import { Redis } from "@upstash/redis";
import { Temporal } from "temporal-polyfill";

/* =========================================================
   STREAK CACHE

   Purpose: skip the DB write when a user re-renders on the
   same day they already checked in.

   Key:    streak:checked:{userId}
   Value:  YYYY-MM-DD in the user's timezone
   TTL:    seconds until the next 4 AM in the user's timezone

   Cache hit  → user already handled today → skip DB entirely.
   Cache miss → fall through to DB check + write.
   ========================================================= */

const redis = Redis.fromEnv();

function cacheKey(userId: string): string {
    return `streak:checked:${userId}`;
}

/* Seconds until the next 4 AM in the user's timezone.
   Falls back to 6 hours if the timezone is invalid. */
function secondsUntilRollover(timezone: string): number {
    try {
        const now = Temporal.Now.zonedDateTimeISO(timezone);
        const today4am = now.withPlainTime(Temporal.PlainTime.from("04:00:00"));
        const next4am =
            today4am.epochMilliseconds > now.epochMilliseconds
                ? today4am
                : today4am.add({ days: 1 });
        const diff = next4am.epochMilliseconds - now.epochMilliseconds;
        return Math.max(60, Math.floor(diff / 1000));
    } catch {
        return 6 * 3600;
    }
}

export async function getCachedCheckIn(userId: string): Promise<string | null> {
    try {
      const getName = await redis.get<string>(cacheKey(userId));
      console.log(getName,'cache-redis-strk ')
        return getName
    } catch {
        return null; // Cache failure → treat as miss
    }
}

export async function setCachedCheckIn(
    userId: string,
    dateStr: string,
    timezone: string,
): Promise<void> {
    try {
        await redis.set(cacheKey(userId), dateStr, {
            ex: secondsUntilRollover(timezone),
        });
    } catch {
        // Silent — streak is still saved in DB
    }
}