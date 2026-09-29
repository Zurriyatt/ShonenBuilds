import { Temporal } from "temporal-polyfill";
import { db } from "@/prisma/db";
import { getCachedCheckIn, setCachedCheckIn } from "@/lib/cache/streak-cache";
import { applyXp } from "./apply-xp";
/* =========================================================
   STREAK UPDATE

   Called from the verify route on every authenticated request.
   Cache-first: DB only touched when the day rolls over.

   XP is written via applyXp() — the single write path.
   ========================================================= */

const DAILY_STREAK_XP = 25;

const MILESTONE_BONUSES: Record<number, number> = {
    7: 250,
    30: 1_000,
    90: 3_000,
    180: 7_500,
    360: 20_000,
};

export interface StreakResult {
    currentStreak: number;
    longestStreak: number;
    isNewDay: boolean;
    xpAwarded: number;
    milestoneHit: number | null;
    milestoneBonus: number;
    newTotalXp: number;
    levelUp: { from: number; to: number } | null;
    tierUp: { from: number; to: number } | null;
}

function todayIn(timezone: string | null | undefined): string {
    try {
        return Temporal.Now.plainDateISO(timezone || "UTC").toString();
    } catch {
        return Temporal.Now.plainDateISO("UTC").toString();
    }
}

/* Helper: read current total from DB (for cache-hit path) */
async function readTotal(userId: string): Promise<number> {
    const row = await db.orm.public.UserXP.where({ userId }).first();
    return row?.totalXp ?? 0;
}

export async function updateStreak(userId: string, timezone?: string | null): Promise<StreakResult> {
    const tz = timezone || "UTC";
    const today = todayIn(tz);

    /* ── Cache hit: already processed today ──────────────────── */
    const cached = await getCachedCheckIn(userId);
    if (cached === today) {
        const row = await db.orm.public.UserStreak.where({ userId }).first();
        const totalXp = await readTotal(userId);

        return {
            currentStreak: row?.currentStreak ?? 0,
            longestStreak: row?.longestStreak ?? 0,
            isNewDay: false,
            xpAwarded: 0,
            milestoneHit: null,
            milestoneBonus: 0,
            newTotalXp: totalXp,
            levelUp: null,
            tierUp: null,
        };
    }

    /* ── Cache miss: compute new streak ──────────────────────── */
    const existing = await db.orm.public.UserStreak.where({ userId }).first();
    const lastDate = existing?.lastCheckInDate;

    let newStreak: number;
    let isNewDay = false;

    if (!lastDate) {
        newStreak = 1;
        isNewDay = true;
    } else if (lastDate === today) {
        newStreak = existing?.currentStreak ?? 1;
    } else {
        const last = Temporal.PlainDate.from(lastDate);
        const now = Temporal.PlainDate.from(today);
        const daysDiff = now.since(last).days;

        newStreak = daysDiff === 1 ? (existing?.currentStreak ?? 0) + 1 : 1;
        isNewDay = true;
    }

    /* ── Milestone check ─────────────────────────────────────── */
    let milestoneHit: number | null = null;
    let milestoneBonus = 0;

    if (isNewDay && MILESTONE_BONUSES[newStreak] !== undefined) {
        milestoneHit = newStreak;
        milestoneBonus = MILESTONE_BONUSES[newStreak];
    }

    const dailyXp = isNewDay ? DAILY_STREAK_XP : 0;
    const xpAwarded = dailyXp + milestoneBonus;

    const longestStreak = Math.max(existing?.longestStreak ?? 0, newStreak);

    /* ── Persist streak row ──────────────────────────────────── */
    if (isNewDay) {
        const nowInstant = Temporal.Now.instant();

        if (existing) {
            await db.orm.public.UserStreak.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak,
                    lastCheckInDate: today,
                    lastCheckInAt: nowInstant,
                },
            });
        } else {
            await db.orm.public.UserStreak.create({
                userId,
                currentStreak: newStreak,
                longestStreak,
                lastCheckInDate: today,
                lastCheckInAt: nowInstant,
            });
        }
    }

    /* ── Apply XP — single source of truth ──────────────────── */
    let newTotalXp: number;
    let levelUp: { from: number; to: number } | null = null;
    let tierUp: { from: number; to: number } | null = null;

    if (isNewDay && xpAwarded > 0) {
        const change = await applyXp(userId, xpAwarded, "streak");
        newTotalXp = change.newTotalXp;
        levelUp = change.levelUp;
        tierUp = change.tierUp;
    } else {
        newTotalXp = await readTotal(userId);
    }

    /* ── Warm cache for the rest of today ────────────────────── */
    await setCachedCheckIn(userId, today, tz);

    return {
        currentStreak: newStreak,
        longestStreak,
        isNewDay,
        xpAwarded,
        milestoneHit,
        milestoneBonus,
        newTotalXp,
        levelUp,
        tierUp,
    };
}
