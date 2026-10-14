import { Temporal } from "temporal-polyfill";
import { db } from "@/prisma/db";
import { getLevelFromXp, getTierFromLevel } from "@/lib/world/MPS";
import { computeUserPower } from "./power";
    
/* ── Helper: get this week's Monday as a string ───────── */
function getThisMonday(timezone: string): string {
    const today = Temporal.Now.plainDateISO(timezone);
    // dayOfWeek: 1 = Monday, 7 = Sunday
    const daysSinceMonday = today.dayOfWeek - 1;
    return today.subtract({ days: daysSinceMonday }).toString();
}

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

    /* ── Write UserXP ────────────────────────────────────── */
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

    /* ── Write WeeklyProgress (writer-side rollover) ─────── */
    const thisMonday = getThisMonday(timezone);
    const weekly = await db.orm.public.WeeklyProgress.where({ userId }).first();

    if (!weekly) {
        // First ever entry — create with snapshot
        const currentPower = await computeUserPower(userId);
        await db.orm.public.WeeklyProgress.create({
            userId,
            weeklyDate: thisMonday,
            weekXp: xpDelta,
            power: currentPower,
        });
    } else if (weekly.weeklyDate !== thisMonday) {
        // Week has rolled over — archive last week, reset this week
        const currentPower = await computeUserPower(userId);
        await db.orm.public.WeeklyProgress
            .where({ userId })
            .update({
                lastWeekDate: weekly.weeklyDate,
                lastWeekXp: weekly.weekXp,
                lastPower: weekly.power,
                weeklyDate: thisMonday,
                weekXp: xpDelta,
                power: currentPower,
            });
    } else {
        // Same week — just accumulate
        await db.orm.public.WeeklyProgress
            .where({ userId })
            .update({ weekXp: weekly.weekXp + xpDelta });
    }

    return {
        newTotalXp,
        delta: xpDelta,
        todayPower: newTodayPower,
        levelUp: newLevel > oldLevel ? { from: oldLevel, to: newLevel } : null,
        tierUp: newTier > oldTier ? { from: oldTier, to: newTier } : null,
    };
}