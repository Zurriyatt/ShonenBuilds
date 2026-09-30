import { Temporal } from "temporal-polyfill";
import { db } from "@/prisma/db";
import { getLevelFromXp, getTierFromLevel } from "@/lib/world/MPS";

/* =========================================================
   APPLY XP + POWER

   The single write path for UserXP.
   Every source (skill, streak, future bonuses) calls this.

   · xpDelta → added to totalXp and skillXp/streakXp
   · powerDelta → added to todayPower (resets on user's day change)
   · timezone → drives the day boundary
   · levelUp / tierUp → detected by comparing before/after
   ========================================================= */

export interface XpChange {
    newTotalXp: number;
    delta: number;
    todayPower: number;
    levelUp: { from: number; to: number } | null;
    tierUp: { from: number; to: number } | null;
}

export async function applyXp(
    userId: string,
    xpDelta: number,
    powerDelta: number,
    source: "skill" | "streak",
    timezone: string = "UTC",
): Promise<XpChange> {
    const existing = await db.orm.public.UserXP.where({ userId }).first();

    const oldTotalXp = existing?.totalXp ?? 0;
    const newTotalXp = Math.max(0, oldTotalXp + xpDelta);

    const oldLevel = getLevelFromXp(oldTotalXp);
    const newLevel = getLevelFromXp(newTotalXp);
    const oldTier = getTierFromLevel(oldLevel);
    const newTier = getTierFromLevel(newLevel);

    /* ── Today's power: reset if user's day changed ──────── */
    let today: string;
    try {
        today = Temporal.Now.plainDateISO(timezone).toString();
    } catch {
        today = Temporal.Now.plainDateISO("UTC").toString();
    }
    const wasToday = existing?.todayDate === today;
    const currentTodayPower = wasToday ? (existing?.todayPower ?? 0) : 0;
    const newTodayPower = currentTodayPower + powerDelta;

    /* ── Write ───────────────────────────────────────────── */
    if (existing) {
        await db.orm.public.UserXP
            .where({ userId })
            .update({
                totalXp: newTotalXp,
                todayPower: newTodayPower,
                todayDate: today,
                ...(source === "skill"
                    ? { skillXp: existing.skillXp + xpDelta }
                    : { streakXp: existing.streakXp + xpDelta }),
            });
    } else {
        await db.orm.public.UserXP.create({
            userId,
            totalXp: newTotalXp,
            skillXp: source === "skill" ? xpDelta : 0,
            streakXp: source === "streak" ? xpDelta : 0,
            todayPower: newTodayPower,
            todayDate: today,
        });
    }

    return {
        newTotalXp,
        delta: xpDelta,
        todayPower: newTodayPower,
        levelUp: newLevel > oldLevel ? { from: oldLevel, to: newLevel } : null,
        tierUp: newTier > oldTier ? { from: oldTier, to: newTier } : null,
    };
}
